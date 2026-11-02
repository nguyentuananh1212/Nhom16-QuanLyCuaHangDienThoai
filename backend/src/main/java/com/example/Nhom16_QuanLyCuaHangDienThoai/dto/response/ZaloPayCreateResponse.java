package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response;

public record ZaloPayCreateResponse(
        int returnCode,
        String returnMessage,
        int subReturnCode,
        String subReturnMessage,
        String orderUrl,
        String zpTransToken,
        String orderToken,
        String appTransId,
        String qrCode
) {}
