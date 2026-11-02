package com.example.Nhom16_QuanLyCuaHangDienThoai.controller;

import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.*;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.AuthResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.UserResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.security.CurrentUser;
import com.example.Nhom16_QuanLyCuaHangDienThoai.service.AuthService;
import com.example.Nhom16_QuanLyCuaHangDienThoai.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @GetMapping("/me")
    public UserResponse me() {
        return userService.getProfile(CurrentUser.id());
    }

    @PutMapping("/me")
    public UserResponse updateMe(@Valid @RequestBody UpdateProfileRequest req) {
        return userService.updateProfile(CurrentUser.id(), req);
    }

    @PutMapping("/me/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@Valid @RequestBody ChangePasswordRequest req) {
        userService.changePassword(CurrentUser.id(), req);
    }
}
