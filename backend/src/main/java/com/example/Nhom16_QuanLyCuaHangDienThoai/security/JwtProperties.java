package com.example.Nhom16_QuanLyCuaHangDienThoai.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @param secret     khoá HMAC, tối thiểu 32 byte (256 bit). Production phải lấy từ biến môi trường.
 * @param expiration thời gian sống của token, tính bằng giây.
 */
@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(String secret, long expiration) {
    public JwtProperties {
        if (secret == null || secret.getBytes(java.nio.charset.StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("app.jwt.secret phải dài tối thiểu 32 ký tự");
        }
        if (expiration <= 0) expiration = 86400;
    }
}
