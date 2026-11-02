package com.example.Nhom16_QuanLyCuaHangDienThoai.service;

import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.LoginRequest;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.RegisterRequest;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.AuthResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.UserResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.User;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.Role;
import com.example.Nhom16_QuanLyCuaHangDienThoai.exception.AppException;
import com.example.Nhom16_QuanLyCuaHangDienThoai.exception.ErrorCode;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.UserRepository;
import com.example.Nhom16_QuanLyCuaHangDienThoai.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }
        // Đăng ký công khai luôn là CUSTOMER — không nhận role từ client
        User user = userRepository.save(User.builder()
                .email(email)
                .password(passwordEncoder.encode(req.password()))
                .fullName(req.fullName().trim())
                .phone(blankToNull(req.phone()))
                .address(blankToNull(req.address()))
                .role(Role.CUSTOMER)
                .build());
        return toAuth(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmailIgnoreCase(req.email().trim())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));
        // Cùng 1 thông báo lỗi cho "sai email" và "sai mật khẩu" để tránh dò tài khoản
        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }
        if (!user.isEnabled()) {
            throw new AppException(ErrorCode.ACCOUNT_DISABLED);
        }
        return toAuth(user);
    }

    private AuthResponse toAuth(User user) {
        return new AuthResponse(jwtService.generateToken(user), "Bearer", jwtService.getExpiration(),
                UserResponse.from(user));
    }

    static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
