package com.example.Nhom16_QuanLyCuaHangDienThoai.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;

import java.nio.charset.StandardCharsets;

/** Trả lỗi 401/403 dạng JSON thống nhất với GlobalExceptionHandler. */
final class JsonAuthHandlers {
    private JsonAuthHandlers() {}

    static AuthenticationEntryPoint entryPoint() {
        return (req, res, ex) -> {
            String auth = req.getHeader("Authorization");
            boolean hasToken = auth != null && auth.regionMatches(true, 0, "Bearer ", 0, 7);
            // Phân biệt "chưa đăng nhập" với "có token nhưng token sai/hết hạn"
            write(res, HttpServletResponse.SC_UNAUTHORIZED,
                    hasToken ? "INVALID_TOKEN" : "UNAUTHENTICATED",
                    hasToken ? "Token không hợp lệ hoặc đã hết hạn, vui lòng đăng nhập lại"
                             : "Bạn cần đăng nhập để thực hiện thao tác này");
        };
    }

    static AccessDeniedHandler accessDenied() {
        return (req, res, ex) -> write(res, HttpServletResponse.SC_FORBIDDEN, "FORBIDDEN",
                "Bạn không có quyền thực hiện thao tác này");
    }

    private static void write(HttpServletResponse res, int status, String code, String message)
            throws java.io.IOException {
        res.setStatus(status);
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        res.setCharacterEncoding(StandardCharsets.UTF_8.name());
        res.getWriter().write("{\"code\":\"" + code + "\",\"message\":\"" + message + "\"}");
    }
}
