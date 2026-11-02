package com.example.Nhom16_QuanLyCuaHangDienThoai.security;

import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

/**
 * Token vẫn còn hạn nhưng tài khoản đã bị khoá hoặc bị đổi quyền -> từ chối ngay,
 * không phải đợi token hết hạn.
 */
@RequiredArgsConstructor
public class ActiveUserJwtValidator implements OAuth2TokenValidator<Jwt> {
    private static final OAuth2Error INVALID = new OAuth2Error("invalid_token", "Tài khoản không còn hiệu lực", null);
    private final UserRepository userRepository;

    @Override
    public OAuth2TokenValidatorResult validate(Jwt jwt) {
        Long id;
        try {
            id = Long.valueOf(jwt.getSubject());
        } catch (NumberFormatException e) {
            return OAuth2TokenValidatorResult.failure(INVALID);
        }
        List<String> roles = jwt.getClaimAsStringList("roles");
        return userRepository.findById(id)
                .filter(u -> u.isEnabled() && roles != null && roles.contains(u.getRole().name()))
                .map(u -> OAuth2TokenValidatorResult.success())
                .orElseGet(() -> OAuth2TokenValidatorResult.failure(INVALID));
    }
}
