package com.example.Nhom16_QuanLyCuaHangDienThoai.service;

import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.AdminUserRequest;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.ChangePasswordRequest;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.UpdateProfileRequest;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.PageResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.UserResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.User;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.Role;
import com.example.Nhom16_QuanLyCuaHangDienThoai.exception.AppException;
import com.example.Nhom16_QuanLyCuaHangDienThoai.exception.ErrorCode;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.example.Nhom16_QuanLyCuaHangDienThoai.service.AuthService.blankToNull;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserResponse getProfile(Long userId) {
        return UserResponse.from(find(userId));
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest req) {
        User u = find(userId);
        u.setFullName(req.fullName().trim());
        u.setPhone(blankToNull(req.phone()));
        u.setAddress(blankToNull(req.address()));
        return UserResponse.from(u);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest req) {
        User u = find(userId);
        if (!passwordEncoder.matches(req.currentPassword(), u.getPassword())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Mật khẩu hiện tại không đúng");
        }
        u.setPassword(passwordEncoder.encode(req.newPassword()));
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> search(String keyword, Role role, int page, int size) {
        return PageResponse.of(userRepository.search(blankToNull(keyword), role,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"))), UserResponse::from);
    }

    @Transactional
    public UserResponse adminUpdate(Long actorId, Long userId, AdminUserRequest req) {
        if (actorId.equals(userId)) {
            // Tránh admin tự khoá / tự hạ quyền mình rồi mất quyền quản trị
            throw new AppException(ErrorCode.BAD_REQUEST, "Không thể tự thay đổi quyền của chính mình");
        }
        User u = find(userId);
        if (u.getRole() == Role.ADMIN && (req.role() != Role.ADMIN || !req.enabled())
                && userRepository.countByRole(Role.ADMIN) <= 1) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Hệ thống phải còn ít nhất 1 admin");
        }
        u.setRole(req.role());
        u.setEnabled(req.enabled());
        return UserResponse.from(u);
    }

    private User find(Long id) {
        return userRepository.findById(id).orElseThrow(() -> AppException.notFound("người dùng", id));
    }
}
