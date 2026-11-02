package com.example.Nhom16_QuanLyCuaHangDienThoai.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * BỘ LỌC PHÒNG CHỐNG TẤN CÔNG MẠNG (Rate Limiting & Anti-Brute Force Filter)
 * - Chống Brute Force mật khẩu vào endpoint /api/auth/login
 * - Chống Spam / DoS / DDoS làm tê liệt hệ thống
 */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RateLimitingFilter extends OncePerRequestFilter {

    // Giới hạn cho đăng nhập: Tối đa 10 lần thử / 1 phút từ 1 IP
    private static final int MAX_LOGIN_ATTEMPTS_PER_MINUTE = 10;
    // Giới hạn chung cho API: Tối đa 120 request / 1 phút từ 1 IP
    private static final int MAX_API_REQUESTS_PER_MINUTE = 120;

    private static class RequestTracker {
        long windowStartTime;
        AtomicInteger count;

        RequestTracker(long now) {
            this.windowStartTime = now;
            this.count = new AtomicInteger(1);
        }
    }

    private final Map<String, RequestTracker> loginIpTrackers = new ConcurrentHashMap<>();
    private final Map<String, RequestTracker> generalIpTrackers = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String clientIp = getClientIp(request);
        String uri = request.getRequestURI();
        long now = System.currentTimeMillis();

        // 1. Kiểm tra phòng chống Brute Force vào API Đăng nhập
        if (uri.endsWith("/api/auth/login") && "POST".equalsIgnoreCase(request.getMethod())) {
            if (isRateLimited(loginIpTrackers, clientIp, MAX_LOGIN_ATTEMPTS_PER_MINUTE, 60_000, now)) {
                log.warn("CẢNH BÁO AN NINH: Phát hiện tấn công Brute Force từ IP: {}. Chặn yêu cầu đăng nhập.", clientIp);
                sendTooManyRequestsResponse(response, "Bạn đã đăng nhập sai quá nhiều lần. Vui lòng đợi 1 phút để tiếp tục.");
                return;
            }
        }

        // 2. Kiểm tra phòng chống Spam / DDoS API nói chung
        if (uri.startsWith("/api/")) {
            if (isRateLimited(generalIpTrackers, clientIp, MAX_API_REQUESTS_PER_MINUTE, 60_000, now)) {
                log.warn("CẢNH BÁO AN NINH: Phát hiện Spam/DoS từ IP: {}. Chặn yêu cầu.", clientIp);
                sendTooManyRequestsResponse(response, "Hệ thống phát hiện tần suất yêu cầu bất thường. Vui lòng thử lại sau giây lát.");
                return;
            }
        }

        // Thêm các Security Headers bảo vệ trình duyệt (chống Clickjacking, MIME-sniffing, XSS)
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("X-XSS-Protection", "1; mode=block");
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimited(Map<String, RequestTracker> trackers, String ip, int maxRequests, long windowMs, long now) {
        RequestTracker tracker = trackers.compute(ip, (k, v) -> {
            if (v == null || (now - v.windowStartTime) > windowMs) {
                return new RequestTracker(now);
            }
            v.count.incrementAndGet();
            return v;
        });

        // Dọn dẹp cache định kỳ nếu quá 5000 IP
        if (trackers.size() > 5000) {
            trackers.entrySet().removeIf(e -> (now - e.getValue().windowStartTime) > windowMs);
        }

        return tracker.count.get() > maxRequests;
    }

    private void sendTooManyRequestsResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        String json = String.format("{\"error\":\"Too Many Requests\",\"message\":\"%s\",\"status\":429}", message);
        response.getWriter().write(json);
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        String xr = request.getHeader("X-Real-IP");
        if (xr != null && !xr.isBlank()) {
            return xr.trim();
        }
        return request.getRemoteAddr();
    }
}
