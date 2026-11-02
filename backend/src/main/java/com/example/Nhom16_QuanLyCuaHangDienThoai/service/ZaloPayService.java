package com.example.Nhom16_QuanLyCuaHangDienThoai.service;

import com.example.Nhom16_QuanLyCuaHangDienThoai.config.ZaloPayProperties;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.OrderResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.ZaloPayCreateResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.ZaloPayQueryResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.Order;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.OrderItem;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.OrderStatus;
import com.example.Nhom16_QuanLyCuaHangDienThoai.exception.AppException;
import com.example.Nhom16_QuanLyCuaHangDienThoai.exception.ErrorCode;
import com.example.Nhom16_QuanLyCuaHangDienThoai.repository.OrderRepository;
import com.example.Nhom16_QuanLyCuaHangDienThoai.util.HMacUtil;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ZaloPayService {

    private static final Logger log = LoggerFactory.getLogger(ZaloPayService.class);

    private final ZaloPayProperties props;
    private final OrderRepository orderRepository;
    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /**
     * Khởi tạo giao dịch thanh toán ZaloPay Sandbox cho đơn hàng.
     */
    @Transactional
    public ZaloPayCreateResponse createPayment(Long userId, boolean isStaff, Long orderId) {
        Order order = findOrderForUser(userId, isStaff, orderId);

        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new AppException(ErrorCode.INVALID_STATUS_TRANSITION, "Đơn hàng không thể thanh toán tiếp");
        }

        if (order.getStatus() == OrderStatus.CONFIRMED && order.getPaidAt() != null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Đơn hàng đã được thanh toán thành công trước đó");
        }

        try {
            String datePrefix = DateTimeFormatter.ofPattern("yyMMdd").format(LocalDate.now());
            String appTransId = datePrefix + "_" + order.getId() + "_" + (System.currentTimeMillis() % 1000000);

            List<Map<String, Object>> itemList = new ArrayList<>();
            for (OrderItem item : order.getItems()) {
                itemList.add(Map.of(
                        "itemid", String.valueOf(item.getProduct().getId()),
                        "itemname", item.getProductName(),
                        "itemprice", item.getUnitPrice().longValue(),
                        "itemquantity", item.getQuantity()
                ));
            }
            String itemsJson = objectMapper.writeValueAsString(itemList);

            String redirectUrl = (props.redirectUrl() != null && !props.redirectUrl().isBlank())
                    ? props.redirectUrl() + "/" + order.getId() + "?payment=zalopay&from_gateway=1"
                    : "http://localhost:3000/orders/" + order.getId() + "?payment=zalopay&from_gateway=1";

            Map<String, Object> embedDataMap = new LinkedHashMap<>();
            embedDataMap.put("redirecturl", redirectUrl);
            embedDataMap.put("orderId", order.getId());
            String embedDataJson = objectMapper.writeValueAsString(embedDataMap);

            long appTime = System.currentTimeMillis();
            long amount = order.getTotalAmount().longValue();
            String appUser = order.getUser() != null ? order.getUser().getEmail() : "user_" + userId;
            String description = "Thanh toán đơn hàng #" + order.getId() + " - PhoneStore";

            // Chuỗi dữ liệu ký MAC theo chuẩn ZaloPay v2:
            // app_id|app_trans_id|app_user|amount|app_time|embed_data|item
            String data = props.appId() + "|" + appTransId + "|" + appUser + "|" + amount + "|"
                    + appTime + "|" + embedDataJson + "|" + itemsJson;
            String mac = HMacUtil.hmacSha256(props.key1(), data);

            Map<String, String> formParams = new LinkedHashMap<>();
            formParams.put("app_id", String.valueOf(props.appId()));
            formParams.put("app_user", appUser);
            formParams.put("app_trans_id", appTransId);
            formParams.put("app_time", String.valueOf(appTime));
            formParams.put("amount", String.valueOf(amount));
            formParams.put("item", itemsJson);
            formParams.put("description", description);
            formParams.put("embed_data", embedDataJson);
            formParams.put("bank_code", "");
            formParams.put("mac", mac);

            if (props.callbackUrl() != null && !props.callbackUrl().isBlank()) {
                formParams.put("callback_url", props.callbackUrl());
            }

            String formBody = buildFormData(formParams);

            log.info("Gửi yêu cầu tạo đơn ZaloPay Sandbox: appTransId={}, amount={}", appTransId, amount);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(props.endpointCreate()))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(formBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            log.info("ZaloPay Sandbox phản hồi HTTP {}: {}", response.statusCode(), response.body());

            JsonNode root = objectMapper.readTree(response.body());
            int returnCode = root.path("return_code").asInt(2);
            int subReturnCode = root.path("sub_return_code").asInt();
            String returnMessage = root.path("return_message").asText();
            String subReturnMessage = root.path("sub_return_message").asText();

            if (returnCode != 1) {
                log.error("Tạo đơn hàng ZaloPay thất bại: {} ({})", returnMessage, subReturnMessage);
                throw new AppException(ErrorCode.BAD_REQUEST, "ZaloPay lỗi: " + returnMessage + " (" + subReturnMessage + ")");
            }

            String orderUrl = root.path("order_url").asText(null);
            String zpTransToken = root.path("zp_trans_token").asText(null);
            String orderToken = root.path("order_token").asText(null);
            String qrCode = root.path("qr_code").asText(null);

            // Lưu paymentRef (appTransId) vào đơn hàng
            order.setPaymentRef(appTransId);
            orderRepository.save(order);

            return new ZaloPayCreateResponse(
                    returnCode, returnMessage, subReturnCode, subReturnMessage,
                    orderUrl, zpTransToken, orderToken, appTransId, qrCode
            );
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi khi kết nối tới cổng thanh toán ZaloPay: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_ERROR, "Không thể kết nối cổng ZaloPay: " + e.getMessage());
        }
    }

    /**
     * Truy vấn trạng thái thanh toán đơn hàng từ máy chủ ZaloPay Sandbox.
     */
    @Transactional
    public ZaloPayQueryResponse queryPayment(Long userId, boolean isStaff, Long orderId) {
        Order order = findOrderForUser(userId, isStaff, orderId);

        // Nếu đơn hàng đã được xác nhận và có paidAt, trả về luôn thành công
        if (order.getStatus() == OrderStatus.CONFIRMED && order.getPaidAt() != null) {
            return new ZaloPayQueryResponse(
                    1, "Giao dịch thành công", 1, "Giao dịch thành công",
                    false, order.getTotalAmount().longValue(), order.getZpTransId(),
                    true, OrderResponse.detail(order)
            );
        }

        String appTransId = order.getPaymentRef();
        if (appTransId == null || appTransId.isBlank()) {
            return new ZaloPayQueryResponse(
                    2, "Đơn hàng chưa khởi tạo thanh toán ZaloPay", -1, "Chưa có app_trans_id",
                    false, null, null, false, OrderResponse.detail(order)
            );
        }

        try {
            // Chuỗi ký MAC kiểm tra trạng thái: app_id|app_trans_id|key1
            String queryData = props.appId() + "|" + appTransId + "|" + props.key1();
            String mac = HMacUtil.hmacSha256(props.key1(), queryData);

            Map<String, String> formParams = new LinkedHashMap<>();
            formParams.put("app_id", String.valueOf(props.appId()));
            formParams.put("app_trans_id", appTransId);
            formParams.put("mac", mac);

            String formBody = buildFormData(formParams);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(props.endpointQuery()))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(formBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            log.info("ZaloPay Query HTTP {}: {}", response.statusCode(), response.body());

            JsonNode root = objectMapper.readTree(response.body());
            int returnCode = root.path("return_code").asInt(2);
            int subReturnCode = root.path("sub_return_code").asInt();
            String returnMessage = root.path("return_message").asText();
            String subReturnMessage = root.path("sub_return_message").asText();
            boolean isProcessing = root.path("is_processing").asBoolean(false);
            Long amount = root.hasNonNull("amount") ? root.path("amount").asLong() : null;
            String zpTransId = root.hasNonNull("zp_trans_id") ? root.path("zp_trans_id").asText() : null;

            boolean isPaid = (returnCode == 1);

            if (isPaid && order.getStatus() == OrderStatus.PENDING) {
                order.setStatus(OrderStatus.CONFIRMED);
                order.setPaidAt(LocalDateTime.now());
                if (zpTransId != null) {
                    order.setZpTransId(zpTransId);
                }
                orderRepository.saveAndFlush(order);

                OrderResponse res = OrderResponse.detail(order);
                emailService.sendOrderConfirmation(res);
                log.info("Đơn hàng #{} đã xác nhận thanh toán thành công qua ZaloPay Query!", order.getId());
            }

            return new ZaloPayQueryResponse(
                    returnCode, returnMessage, subReturnCode, subReturnMessage,
                    isProcessing, amount, zpTransId, isPaid, OrderResponse.detail(order)
            );
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra trạng thái ZaloPay: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_ERROR, "Không thể kiểm tra trạng thái ZaloPay: " + e.getMessage());
        }
    }

    /**
     * Giả lập thanh toán thành công tức thì cho đơn hàng trong môi trường Sandbox.
     */
    @Transactional
    public OrderResponse simulateSuccess(Long userId, boolean isStaff, Long orderId) {
        Order order = findOrderForUser(userId, isStaff, orderId);

        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new AppException(ErrorCode.INVALID_STATUS_TRANSITION, "Đơn hàng không thể thanh toán tiếp");
        }

        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CONFIRMED);
            order.setPaidAt(LocalDateTime.now());
            if (order.getPaymentRef() == null || order.getPaymentRef().isBlank()) {
                String datePrefix = DateTimeFormatter.ofPattern("yyMMdd").format(LocalDate.now());
                order.setPaymentRef(datePrefix + "_" + order.getId() + "_SANDBOX");
            }
            order.setZpTransId("SANDBOX_ZP_" + System.currentTimeMillis());
            orderRepository.saveAndFlush(order);

            OrderResponse res = OrderResponse.detail(order);
            emailService.sendOrderConfirmation(res);
            log.info("Giả lập thanh toán thành công đơn hàng #{} (Sandbox Test)", order.getId());
            return res;
        }

        return OrderResponse.detail(order);
    }

    /**
     * Xử lý Webhook IPN Callback nhận từ ZaloPay.
     */
    @Transactional
    public Map<String, Object> handleCallback(String jsonPayload) {
        try {
            JsonNode root = objectMapper.readTree(jsonPayload);
            String dataStr = root.path("data").asText();
            String reqMac = root.path("mac").asText();

            String expectedMac = HMacUtil.hmacSha256(props.key2(), dataStr);
            if (!expectedMac.equalsIgnoreCase(reqMac)) {
                log.warn("ZaloPay Callback MAC không khớp: expected={}, actual={}", expectedMac, reqMac);
                return Map.of("return_code", -1, "return_message", "mac not equal");
            }

            JsonNode dataJson = objectMapper.readTree(dataStr);
            String appTransId = dataJson.path("app_trans_id").asText();
            String zpTransId = dataJson.path("zp_trans_id").asText(null);

            log.info("ZaloPay Callback hợp lệ cho appTransId={}", appTransId);

            Optional<Order> optOrder = orderRepository.findDetailByPaymentRef(appTransId);
            if (optOrder.isPresent()) {
                Order order = optOrder.get();
                if (order.getStatus() == OrderStatus.PENDING) {
                    order.setStatus(OrderStatus.CONFIRMED);
                    order.setPaidAt(LocalDateTime.now());
                    if (zpTransId != null) {
                        order.setZpTransId(zpTransId);
                    }
                    orderRepository.saveAndFlush(order);

                    OrderResponse res = OrderResponse.detail(order);
                    emailService.sendOrderConfirmation(res);
                    log.info("Đơn hàng #{} đã xác nhận thành công qua ZaloPay Callback!", order.getId());
                }
            } else {
                log.warn("Không tìm thấy đơn hàng với paymentRef={}", appTransId);
            }

            return Map.of("return_code", 1, "return_message", "success");
        } catch (Exception e) {
            log.error("Lỗi khi xử lý ZaloPay Callback: {}", e.getMessage(), e);
            return Map.of("return_code", 0, "return_message", e.getMessage());
        }
    }

    private Order findOrderForUser(Long userId, boolean isStaff, Long orderId) {
        Order order = orderRepository.findDetailById(orderId)
                .orElseThrow(() -> AppException.notFound("đơn hàng", orderId));
        if (!isStaff && !order.getUser().getId().equals(userId)) {
            throw AppException.notFound("đơn hàng", orderId);
        }
        return order;
    }

    private static String buildFormData(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (!sb.isEmpty()) {
                sb.append("&");
            }
            sb.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8));
            sb.append("=");
            sb.append(URLEncoder.encode(entry.getValue() != null ? entry.getValue() : "", StandardCharsets.UTF_8));
        }
        return sb.toString();
    }
}
