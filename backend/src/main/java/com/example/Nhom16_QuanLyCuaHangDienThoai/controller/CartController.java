package com.example.Nhom16_QuanLyCuaHangDienThoai.controller;

import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.CartItemRequest;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.request.UpdateQuantityRequest;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.CartResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.security.CurrentUser;
import com.example.Nhom16_QuanLyCuaHangDienThoai.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    @GetMapping
    public CartResponse get() { return cartService.getCart(CurrentUser.id()); }

    @PostMapping("/items")
    public CartResponse add(@Valid @RequestBody CartItemRequest req) { return cartService.addItem(CurrentUser.id(), req); }

    @PutMapping("/items/{itemId}")
    public CartResponse update(@PathVariable Long itemId, @Valid @RequestBody UpdateQuantityRequest req) {
        return cartService.updateQuantity(CurrentUser.id(), itemId, req.quantity());
    }

    @DeleteMapping("/items/{itemId}")
    public CartResponse remove(@PathVariable Long itemId) { return cartService.removeItem(CurrentUser.id(), itemId); }
}
