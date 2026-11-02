package com.example.Nhom16_QuanLyCuaHangDienThoai.controller;

import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.VoucherApplyRequest;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.VoucherRequest;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.VoucherApplyResult;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.VoucherResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.service.VoucherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;

    // ===== Dành cho khách hàng (Shop) =====

    /**
     * Lấy danh sách voucher khả dụng để hiển thị gợi ý tại checkout/giỏ hàng.
     */
    @GetMapping("/api/vouchers/available")
    public List<VoucherResponse> getAvailable() {
        return voucherService.getAvailableForShop();
    }

    /**
     * Khách hàng áp dụng mã giảm giá và xem trước số tiền được trừ.
     */
    @PostMapping("/api/vouchers/apply")
    public VoucherApplyResult applyVoucher(@Valid @RequestBody VoucherApplyRequest req) {
        return voucherService.checkVoucher(req.code(), req.orderAmount());
    }

    // ===== Dành cho Quản trị viên (Admin) =====

    @GetMapping("/api/admin/vouchers")
    public List<VoucherResponse> listAdmin() {
        return voucherService.listAll();
    }

    @PostMapping("/api/admin/vouchers")
    @ResponseStatus(HttpStatus.CREATED)
    public VoucherResponse create(@Valid @RequestBody VoucherRequest req) {
        return voucherService.create(req);
    }

    @PutMapping("/api/admin/vouchers/{id}")
    public VoucherResponse update(@PathVariable Long id, @Valid @RequestBody VoucherRequest req) {
        return voucherService.update(id, req);
    }

    @PostMapping("/api/admin/vouchers/{id}/toggle")
    public VoucherResponse toggle(@PathVariable Long id) {
        return voucherService.toggle(id);
    }

    @DeleteMapping("/api/admin/vouchers/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        voucherService.delete(id);
    }
}
