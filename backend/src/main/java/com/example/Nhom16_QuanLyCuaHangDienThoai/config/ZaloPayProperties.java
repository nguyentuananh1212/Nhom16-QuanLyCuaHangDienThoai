package com.example.Nhom16_QuanLyCuaHangDienThoai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "app.zalopay")
public record ZaloPayProperties(
        @DefaultValue("554") int appId,
        @DefaultValue("8NdU5pG5R2spGHGhyO99HN1OhD8IQJBn") String key1,
        @DefaultValue("uUfsWgfLkRLzq6W2uNXTCxrfxs51auny") String key2,
        @DefaultValue("https://sb-openapi.zalopay.vn/v2/create") String endpointCreate,
        @DefaultValue("https://sb-openapi.zalopay.vn/v2/query") String endpointQuery,
        @DefaultValue("http://localhost:8080/api/payment/zalopay/callback") String callbackUrl,
        @DefaultValue("http://localhost:3000/orders") String redirectUrl
) {
    public ZaloPayProperties {
        if (appId == 0) appId = 554;
        if (key1 == null || key1.isBlank()) key1 = "8NdU5pG5R2spGHGhyO99HN1OhD8IQJBn";
        if (key2 == null || key2.isBlank()) key2 = "uUfsWgfLkRLzq6W2uNXTCxrfxs51auny";
        if (endpointCreate == null || endpointCreate.isBlank()) endpointCreate = "https://sb-openapi.zalopay.vn/v2/create";
        if (endpointQuery == null || endpointQuery.isBlank()) endpointQuery = "https://sb-openapi.zalopay.vn/v2/query";
        if (callbackUrl == null || callbackUrl.isBlank()) callbackUrl = "http://localhost:8080/api/payment/zalopay/callback";
        if (redirectUrl == null || redirectUrl.isBlank()) redirectUrl = "http://localhost:3000/orders";
    }
}
