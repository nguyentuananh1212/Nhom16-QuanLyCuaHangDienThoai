package com.example.Nhom16_QuanLyCuaHangDienThoai.exception;

import lombok.Getter;

@Getter
public class AppException extends RuntimeException {
    private final ErrorCode errorCode;

    public AppException(ErrorCode errorCode) {
        this(errorCode, errorCode.getDefaultMessage());
    }

    public AppException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public static AppException notFound(String what, Object id) {
        return new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy " + what + " #" + id);
    }
}
