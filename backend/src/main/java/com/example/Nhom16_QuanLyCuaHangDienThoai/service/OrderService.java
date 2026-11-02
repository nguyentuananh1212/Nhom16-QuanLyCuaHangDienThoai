package com.example.Nhom16_QuanLyCuaHangDienThoai.service;

import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.CheckoutRequest;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.OrderResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.PageResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.*;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.OrderStatus;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.PaymentMethod;
import com.example.Nhom16_QuanLyCuaHangDienThoai.exception.AppException;
import com.example.Nhom16_QuanLyCuaHangDienThoai.exception.ErrorCode;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.OrderRepository;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.ProductRepository;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

import static com.example.Nhom16_QuanLyCuaHangDienThoai.service.AuthService.blankToNull;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final EmailService emailService;
    private final VoucherService voucherService;

    /**
     * Đặt hàng từ giỏ. Toàn bộ trong 1 transaction:
     * trừ kho thất bại ở bất kỳ sản phẩm nào -> rollback toàn bộ, không có đơn "nửa vời".
     */
    @Transactional
    public OrderResponse checkout(Long userId, CheckoutRequest req) {
        List<CartItems> cartItems = cartService.itemsOf(userId);
        if (cartItems.isEmpty()) throw new AppException(ErrorCode.CART_EMPTY);

        String customEmail = blankToNull(req.receiverEmail());

        // COD (Tiền mặt): Tự động xác nhận ngay.
        // Chuyển khoản QR: Để PENDING để khách quét mã QR và bấm xác nhận thanh toán.
        OrderStatus initialStatus = (req.paymentMethod() == PaymentMethod.COD)
                ? OrderStatus.CONFIRMED
                : OrderStatus.PENDING;

        Order order = Order.builder()
                .user(userRepository.getReferenceById(userId))
                .receiverName(req.receiverName().trim())
                .receiverPhone(req.receiverPhone().trim())
                .receiverEmail(customEmail != null ? customEmail.trim().toLowerCase() : null)
                .shippingAddress(req.shippingAddress().trim())
                .note(blankToNull(req.note()))
                .paymentMethod(req.paymentMethod())
                .status(initialStatus)
                .totalAmount(BigDecimal.ZERO)
                .build();

        // Sắp theo productId để các transaction luôn khoá dòng theo cùng thứ tự -> tránh deadlock
        List<CartItems> sorted = cartItems.stream()
                .sorted(Comparator.comparing(ci -> ci.getProduct().getId())).toList();

        BigDecimal total = BigDecimal.ZERO;
        for (CartItems ci : sorted) {
            Product p = ci.getProduct();
            // Snapshot giá/tên tại thời điểm đặt hàng
            String name = p.getName();
            BigDecimal unitPrice = p.getEffectivePrice();
            Long productId = p.getId();

            if (productRepository.decreaseStock(productId, ci.getQuantity()) == 0) {
                throw new AppException(ErrorCode.OUT_OF_STOCK,
                        "\"" + name + "\" không đủ hàng hoặc đã ngừng bán, vui lòng cập nhật giỏ hàng");
            }
            order.getItems().add(OrderItem.builder()
                    .order(order)
                    .product(productRepository.getReferenceById(productId))
                    .productName(name)
                    .unitPrice(unitPrice)
                    .quantity(ci.getQuantity())
                    .build());
            total = total.add(unitPrice.multiply(BigDecimal.valueOf(ci.getQuantity())));
        }

        // Xử lý mã giảm giá voucher (nếu khách có áp dụng)
        BigDecimal subtotal = total;
        BigDecimal discount = BigDecimal.ZERO;
        String voucherCode = null;

        if (req.voucherCode() != null && !req.voucherCode().isBlank()) {
            voucherCode = req.voucherCode().trim().toUpperCase();
            discount = voucherService.applyAndConsume(voucherCode, subtotal);
        }

        BigDecimal finalTotal = subtotal.subtract(discount).max(BigDecimal.ZERO);
        order.setVoucherCode(voucherCode);
        order.setDiscountAmount(discount);
        order.setTotalAmount(finalTotal);

        Order saved = orderRepository.save(order);
        cartService.clear(userId);
        OrderResponse response = detail(saved.getId());

        // Gửi email chi tiết đơn hàng tới email của khách hàng
        emailService.sendOrderConfirmation(response);

        return response;
    }

    @Transactional(readOnly = true)
    public String getOrderEmailHtml(Long userId, boolean isStaff, Long orderId) {
        OrderResponse o = getForUser(userId, isStaff, orderId);
        return emailService.getOrderEmailHtml(o);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> myOrders(Long userId, int page, int size) {
        return PageResponse.of(orderRepository.findByUserId(userId,
                PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50), Sort.by(Sort.Direction.DESC, "id"))),
                OrderResponse::summary);
    }

    /** Khách chỉ xem được đơn của mình; nhân viên/admin xem được tất cả. */
    @Transactional(readOnly = true)
    public OrderResponse getForUser(Long userId, boolean isStaff, Long orderId) {
        Order o = findDetail(orderId);
        if (!isStaff && !o.getUser().getId().equals(userId)) {
            // Trả 404 thay vì 403 để không tiết lộ đơn hàng có tồn tại
            throw AppException.notFound("đơn hàng", orderId);
        }
        return OrderResponse.detail(o);
    }

    @Transactional
    public OrderResponse cancelByCustomer(Long userId, Long orderId) {
        Order o = findDetail(orderId);
        if (!o.getUser().getId().equals(userId)) throw AppException.notFound("đơn hàng", orderId);
        if (!o.getStatus().isCancellable()) {
            throw new AppException(ErrorCode.INVALID_STATUS_TRANSITION, "Chỉ huỷ được đơn hàng khi chưa bắt đầu giao hàng");
        }
        changeStatus(o, OrderStatus.CANCELLED);
        return OrderResponse.detail(o);
    }

    /**
     * Giả lập thanh toán thành công cho đơn hàng chuyển khoản (mã QR ảo).
     */
    @Transactional
    public OrderResponse mockPay(Long userId, Long orderId) {
        Order o = findDetail(orderId);
        if (!o.getUser().getId().equals(userId)) throw AppException.notFound("đơn hàng", orderId);
        if (o.getStatus() == OrderStatus.CANCELLED || o.getStatus() == OrderStatus.DELIVERED) {
            throw new AppException(ErrorCode.INVALID_STATUS_TRANSITION, "Đơn hàng này không thể thanh toán tiếp");
        }
        if (o.getPaymentMethod() != com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.PaymentMethod.BANK_TRANSFER) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Đơn hàng này không sử dụng phương thức chuyển khoản qua mã QR");
        }
        if (o.getStatus() == OrderStatus.PENDING) {
            changeStatus(o, OrderStatus.CONFIRMED);
            OrderResponse response = OrderResponse.detail(o);
            emailService.sendOrderConfirmation(response);
            return response;
        }
        return OrderResponse.detail(o);
    }

    /**
     * Tự động xác nhận tất cả các đơn hàng đang ở trạng thái PENDING.
     */
    @Transactional
    public int autoConfirmAllPending() {
        List<Order> pendings = orderRepository.findByStatus(OrderStatus.PENDING);
        for (Order o : pendings) {
            changeStatus(o, OrderStatus.CONFIRMED);
        }
        return pendings.size();
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> search(OrderStatus status, String keyword, int page, int size) {
        return PageResponse.of(orderRepository.search(status, blankToNull(keyword),
                PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50), Sort.by(Sort.Direction.DESC, "id"))),
                OrderResponse::summary);
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, OrderStatus target) {
        Order o = findDetail(orderId);
        changeStatus(o, target);
        return OrderResponse.detail(o);
    }

    private void changeStatus(Order o, OrderStatus target) {
        if (!o.getStatus().canTransitionTo(target)) {
            throw new AppException(ErrorCode.INVALID_STATUS_TRANSITION,
                    "Không thể chuyển từ " + o.getStatus() + " sang " + target);
        }
        if (target == OrderStatus.CANCELLED) {
            // Huỷ đơn -> hoàn kho
            o.getItems().stream()
                    .sorted(Comparator.comparing(i -> i.getProduct().getId()))
                    .forEach(i -> productRepository.restoreStock(i.getProduct().getId(), i.getQuantity()));
        }
        o.setStatus(target);
        // Ghi ngay để @Version phát hiện xung đột trong transaction này
        orderRepository.saveAndFlush(o);
    }

    private OrderResponse detail(Long id) {
        return OrderResponse.detail(findDetail(id));
    }

    private Order findDetail(Long id) {
        return orderRepository.findDetailById(id).orElseThrow(() -> AppException.notFound("đơn hàng", id));
    }
}
