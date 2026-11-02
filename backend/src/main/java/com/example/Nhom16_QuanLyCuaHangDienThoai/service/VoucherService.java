package com.example.Nhom16_QuanLyCuaHangDienThoai.service;

import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.VoucherRequest;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.VoucherApplyResult;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.VoucherResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Voucher;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.DiscountType;
import com.example.Nhom16_QuanLyCuaHangDienThoai.exception.AppException;
import com.example.Nhom16_QuanLyCuaHangDienThoai.exception.ErrorCode;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private static final NumberFormat VND_FORMAT = NumberFormat.getNumberInstance(new Locale("vi", "VN"));

    /**
     * Kiểm tra tính hợp lệ và tính số tiền giảm của voucher cho giỏ hàng/đơn hàng.
     */
    @Transactional(readOnly = true)
    public VoucherApplyResult checkVoucher(String code, BigDecimal orderAmount) {
        if (code == null || code.isBlank()) {
            return new VoucherApplyResult(false, null, null, BigDecimal.ZERO, orderAmount, "Vui lòng nhập mã giảm giá");
        }
        if (orderAmount == null || orderAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return new VoucherApplyResult(false, code, null, BigDecimal.ZERO, BigDecimal.ZERO, "Đơn hàng chưa có sản phẩm");
        }

        var opt = voucherRepository.findByCodeIgnoreCase(code.trim());
        if (opt.isEmpty()) {
            return new VoucherApplyResult(false, code, null, BigDecimal.ZERO, orderAmount, "Mã giảm giá không tồn tại hoặc đã bị xóa");
        }

        Voucher v = opt.get();
        if (!v.isActive()) {
            return new VoucherApplyResult(false, v.getCode(), v.getName(), BigDecimal.ZERO, orderAmount, "Mã giảm giá này hiện đang tạm khóa");
        }

        LocalDate today = LocalDate.now();
        if (v.getStartDate() != null && today.isBefore(v.getStartDate())) {
            return new VoucherApplyResult(false, v.getCode(), v.getName(), BigDecimal.ZERO, orderAmount,
                    "Chương trình khuyến mãi này sẽ bắt đầu từ ngày " + v.getStartDate());
        }
        if (v.getEndDate() != null && today.isAfter(v.getEndDate())) {
            return new VoucherApplyResult(false, v.getCode(), v.getName(), BigDecimal.ZERO, orderAmount, "Mã giảm giá đã hết hạn sử dụng");
        }
        if (v.getUsedCount() >= v.getQuantity()) {
            return new VoucherApplyResult(false, v.getCode(), v.getName(), BigDecimal.ZERO, orderAmount, "Mã giảm giá đã hết lượt sử dụng");
        }
        if (v.getMinOrderAmount() != null && orderAmount.compareTo(v.getMinOrderAmount()) < 0) {
            return new VoucherApplyResult(false, v.getCode(), v.getName(), BigDecimal.ZERO, orderAmount,
                    "Đơn hàng cần đạt tối thiểu " + VND_FORMAT.format(v.getMinOrderAmount()) + " ₫ để dùng mã này");
        }

        BigDecimal discount;
        if (v.getDiscountType() == DiscountType.FIXED_AMOUNT) {
            discount = v.getDiscountValue().min(orderAmount);
        } else {
            // PERCENT: orderAmount * discountValue / 100
            discount = orderAmount.multiply(v.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
            if (v.getMaxDiscountAmount() != null && v.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                discount = discount.min(v.getMaxDiscountAmount());
            }
            discount = discount.min(orderAmount);
        }

        BigDecimal finalAmount = orderAmount.subtract(discount).max(BigDecimal.ZERO);
        return new VoucherApplyResult(true, v.getCode(), v.getName(), discount, finalAmount,
                "Áp dụng thành công: " + v.getName() + " (Giảm " + VND_FORMAT.format(discount) + " ₫)");
    }

    /**
     * Dùng voucher trong quá trình Checkout (ghi nhận số lượt đã dùng).
     */
    @Transactional
    public BigDecimal applyAndConsume(String code, BigDecimal orderAmount) {
        VoucherApplyResult result = checkVoucher(code, orderAmount);
        if (!result.valid()) {
            throw new AppException(ErrorCode.BAD_REQUEST, result.message());
        }
        Voucher v = voucherRepository.findByCodeIgnoreCase(code.trim()).orElseThrow();
        v.setUsedCount(v.getUsedCount() + 1);
        voucherRepository.save(v);
        return result.discountAmount();
    }

    /**
     * Danh sách voucher đang có hiệu lực để gợi ý cho khách hàng chọn tại trang giỏ hàng / checkout.
     */
    @Transactional(readOnly = true)
    public List<VoucherResponse> getAvailableForShop() {
        LocalDate today = LocalDate.now();
        return voucherRepository.findByActiveTrueOrderByCreatedAtDesc().stream()
                .filter(v -> v.getUsedCount() < v.getQuantity())
                .filter(v -> v.getStartDate() == null || !today.isBefore(v.getStartDate()))
                .filter(v -> v.getEndDate() == null || !today.isAfter(v.getEndDate()))
                .map(VoucherResponse::from)
                .toList();
    }

    // ================= Quản trị (Admin) =================

    @Transactional(readOnly = true)
    public List<VoucherResponse> listAll() {
        return voucherRepository.findAll().stream()
                .sorted((a, b) -> b.getId().compareTo(a.getId()))
                .map(VoucherResponse::from)
                .toList();
    }

    @Transactional
    public VoucherResponse create(VoucherRequest req) {
        String code = req.code().trim().toUpperCase();
        if (voucherRepository.existsByCodeIgnoreCase(code)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Mã voucher \"" + code + "\" đã tồn tại");
        }

        Voucher v = Voucher.builder()
                .code(code)
                .name(req.name().trim())
                .description(req.description() != null ? req.description().trim() : null)
                .discountType(req.discountType())
                .discountValue(req.discountValue())
                .minOrderAmount(req.minOrderAmount() != null ? req.minOrderAmount() : BigDecimal.ZERO)
                .maxDiscountAmount(req.maxDiscountAmount())
                .quantity(req.quantity())
                .usedCount(0)
                .startDate(req.startDate())
                .endDate(req.endDate())
                .active(req.active() != null ? req.active() : true)
                .build();

        return VoucherResponse.from(voucherRepository.save(v));
    }

    @Transactional
    public VoucherResponse update(Long id, VoucherRequest req) {
        Voucher v = voucherRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("mã giảm giá", id));

        String code = req.code().trim().toUpperCase();
        if (!v.getCode().equalsIgnoreCase(code) && voucherRepository.existsByCodeIgnoreCase(code)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Mã voucher \"" + code + "\" đã tồn tại");
        }

        v.setCode(code);
        v.setName(req.name().trim());
        v.setDescription(req.description() != null ? req.description().trim() : null);
        v.setDiscountType(req.discountType());
        v.setDiscountValue(req.discountValue());
        v.setMinOrderAmount(req.minOrderAmount());
        v.setMaxDiscountAmount(req.maxDiscountAmount());
        v.setQuantity(req.quantity());
        v.setStartDate(req.startDate());
        v.setEndDate(req.endDate());
        if (req.active() != null) v.setActive(req.active());

        return VoucherResponse.from(voucherRepository.save(v));
    }

    @Transactional
    public VoucherResponse toggle(Long id) {
        Voucher v = voucherRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("mã giảm giá", id));
        v.setActive(!v.isActive());
        return VoucherResponse.from(voucherRepository.save(v));
    }

    @Transactional
    public void delete(Long id) {
        Voucher v = voucherRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("mã giảm giá", id));
        voucherRepository.delete(v);
    }
}
