package com.example.Nhom16_QuanLyCuaHangDienThoai.service;

import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.CartItemRequest;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.CartResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.CartResponse.CartItemResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Cart;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.CartItems;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Product;
import com.example.Nhom16_QuanLyCuaHangDienThoai.exception.AppException;
import com.example.Nhom16_QuanLyCuaHangDienThoai.exception.ErrorCode;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.CartItemsRepository;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.CartRepository;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.ProductRepository;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {
    static final int MAX_QTY_PER_ITEM = 50;

    private final CartRepository cartRepository;
    private final CartItemsRepository cartItemsRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public CartResponse getCart(Long userId) {
        return toResponse(getOrCreate(userId));
    }

    @Transactional
    public CartResponse addItem(Long userId, CartItemRequest req) {
        Cart cart = getOrCreate(userId);
        Product product = productRepository.findById(req.productId())
                .filter(Product::isActive)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_UNAVAILABLE));

        CartItems item = cartItemsRepository.findByCartIdAndProductId(cart.getId(), product.getId())
                .orElseGet(() -> CartItems.builder().cart(cart).product(product).quantity(0).build());
        int newQty = item.getQuantity() + req.quantity();
        ensureStock(product, newQty);
        item.setQuantity(newQty);
        cartItemsRepository.save(item);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse updateQuantity(Long userId, Long itemId, int quantity) {
        Cart cart = getOrCreate(userId);
        CartItems item = findOwnedItem(cart, itemId);
        ensureStock(item.getProduct(), quantity);
        item.setQuantity(quantity);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse removeItem(Long userId, Long itemId) {
        Cart cart = getOrCreate(userId);
        cartItemsRepository.delete(findOwnedItem(cart, itemId));
        cartItemsRepository.flush();
        return toResponse(cart);
    }

    @Transactional
    public void clear(Long userId) {
        cartRepository.findByUserId(userId).ifPresent(c -> c.getItems().clear());
    }

    /** Dùng nội bộ khi checkout. */
    List<CartItems> itemsOf(Long userId) {
        return cartRepository.findByUserId(userId)
                .map(c -> cartItemsRepository.findByCartIdOrderByIdAsc(c.getId()))
                .orElse(List.of());
    }

    private CartItems findOwnedItem(Cart cart, Long itemId) {
        // Truy vấn theo cả itemId và cartId -> không sửa/xoá được item trong giỏ người khác (IDOR)
        return cartItemsRepository.findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() -> AppException.notFound("sản phẩm trong giỏ", itemId));
    }

    private void ensureStock(Product product, int qty) {
        if (qty > MAX_QTY_PER_ITEM) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Mỗi sản phẩm tối đa " + MAX_QTY_PER_ITEM + " chiếc");
        }
        if (qty > product.getStock()) {
            throw new AppException(ErrorCode.OUT_OF_STOCK, "\"" + product.getName() + "\" chỉ còn " + product.getStock() + " sản phẩm");
        }
    }

    private Cart getOrCreate(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> cartRepository.save(
                Cart.builder().user(userRepository.getReferenceById(userId)).build()));
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItems> items = cartItemsRepository.findByCartIdOrderByIdAsc(cart.getId());
        BigDecimal total = BigDecimal.ZERO;
        int totalQty = 0;
        List<CartItemResponse> lines = new java.util.ArrayList<>();
        for (CartItems i : items) {
            Product p = i.getProduct();
            BigDecimal unit = p.getEffectivePrice();
            BigDecimal line = unit.multiply(BigDecimal.valueOf(i.getQuantity()));
            boolean available = p.isActive() && p.getStock() >= i.getQuantity();
            if (available) {
                total = total.add(line);
                totalQty += i.getQuantity();
            }
            lines.add(new CartItemResponse(i.getId(), p.getId(), p.getName(), p.getImageUrl(), unit,
                    i.getQuantity(), p.getStock(), available, line));
        }
        return new CartResponse(lines, totalQty, total);
    }
}
