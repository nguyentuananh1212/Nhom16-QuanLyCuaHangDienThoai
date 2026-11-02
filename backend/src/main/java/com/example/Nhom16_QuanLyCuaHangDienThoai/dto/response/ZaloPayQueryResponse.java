package com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response;

public record ZaloPayQueryResponse(
        int returnCode,
        String returnMessage,
        int subReturnCode,
        String subReturnMessage,
        boolean isProcessing,
        Long amount,
        String zpTransId,
        boolean isPaid,
        OrderResponse order
) {}
