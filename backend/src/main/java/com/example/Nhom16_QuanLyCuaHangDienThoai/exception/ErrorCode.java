package com.example.Nhom16_QuanLyCuaHangDienThoai.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "Dữ liệu không hợp lệ"),
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "Yêu cầu không hợp lệ"),
    UNAUTHENTICATED(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng"),
    ACCOUNT_DISABLED(HttpStatus.FORBIDDEN, "Tài khoản đã bị khoá"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "Bạn không có quyền thực hiện thao tác này"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy dữ liệu"),
    EMAIL_EXISTED(HttpStatus.CONFLICT, "Email đã được sử dụng"),
    NAME_EXISTED(HttpStatus.CONFLICT, "Tên đã tồn tại"),
    IN_USE(HttpStatus.CONFLICT, "Dữ liệu đang được sử dụng, không thể xoá"),
    OUT_OF_STOCK(HttpStatus.CONFLICT, "Sản phẩm không đủ hàng"),
    PRODUCT_UNAVAILABLE(HttpStatus.CONFLICT, "Sản phẩm đã ngừng kinh doanh"),
    CART_EMPTY(HttpStatus.BAD_REQUEST, "Giỏ hàng trống"),
    INVALID_STATUS_TRANSITION(HttpStatus.CONFLICT, "Không thể chuyển trạng thái đơn hàng"),
    ALREADY_REVIEWED(HttpStatus.CONFLICT, "Bạn đã đánh giá sản phẩm này"),
    NOT_PURCHASED(HttpStatus.FORBIDDEN, "Chỉ khách đã nhận hàng mới được đánh giá"),
    CONCURRENT_UPDATE(HttpStatus.CONFLICT, "Dữ liệu vừa được người khác cập nhật, vui lòng tải lại"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi hệ thống");

    private final HttpStatus status;
    private final String defaultMessage;

    ErrorCode(HttpStatus status, String defaultMessage) {
        this.status = status;
        this.defaultMessage = defaultMessage;
    }
}
