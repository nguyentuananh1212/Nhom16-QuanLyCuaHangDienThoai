package com.example.Nhom16_QuanLyCuaHangDienThoai.service;

import com.example.Nhom16_QuanLyCuaHangDienThoai.dto.response.OrderResponse;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.OrderStatus;
import com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums.PaymentMethod;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${app.mail.from:noreply.aurastore@gmail.com}")
    private String fromEmail;

    @Value("${app.mail.sender-name:AURA PHONESTORE}")
    private String senderName;

    private static final NumberFormat VND_FORMAT = NumberFormat.getNumberInstance(new Locale("vi", "VN"));
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy");

    /**
     * Gửi email xác nhận đơn hàng bất đồng bộ (không làm chậm luồng checkout của khách).
     */
    @Async
    public void sendOrderConfirmation(OrderResponse order) {
        String recipient = order.notificationEmail();
        if (recipient == null || recipient.isBlank()) {
            log.warn("Đơn hàng #{} không có email khách hàng để gửi thông báo", order.id());
            return;
        }

        String subject = (order.status() == OrderStatus.CONFIRMED)
                ? "[AURA STORE] Đơn hàng #" + order.id() + " đã được xác nhận thành công"
                : "[AURA STORE] Đặt hàng #" + order.id() + " thành công - Chờ thanh toán QR";
        String htmlContent = buildOrderEmailHtml(order);

        boolean hasCredentials = mailSender != null && mailUsername != null && !mailUsername.isBlank();
        if (hasCredentials) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

                String senderAddress = (fromEmail != null && !fromEmail.isBlank() && !fromEmail.contains("noreply.aurastore@gmail.com"))
                        ? fromEmail
                        : mailUsername;
                helper.setFrom(new InternetAddress(senderAddress, senderName, StandardCharsets.UTF_8.name()));
                helper.setTo(recipient);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);

                mailSender.send(message);
                log.info(" Đã gửi thành công email xác nhận đơn hàng #{} tới {}", order.id(), recipient);
                return;
            } catch (Exception ex) {
                log.warn(" Không thể gửi qua SMTP ({}). Tự động ghi nhật ký email mô phỏng.", ex.getMessage());
            }
        } else {
            log.info("ℹ Chưa cấu hình spring.mail.username (SMTP). Gửi email mô phỏng cho đơn #{}.", order.id());
        }

        // Ghi log chi tiết nội dung email khi chạy ở chế độ mô phỏng / dev
        logSimulatedEmail(order, recipient, subject);
    }

    /**
     * Xuất HTML email để người dùng hoặc quản trị viên có thể xem trực tiếp mẫu email đã gửi.
     */
    public String getOrderEmailHtml(OrderResponse order) {
        return buildOrderEmailHtml(order);
    }

    private void logSimulatedEmail(OrderResponse order, String recipient, String subject) {
        String payLabel = order.paymentMethod() == PaymentMethod.COD
                ? "Thanh toán khi nhận hàng (COD)"
                : "Chuyển khoản qua mã QR (VietQR)";

        log.info("""
                \n============================== [EMAIL THÔNG BÁO ĐƠN HÀNG] ==============================
                Gửi tới       : {}
                Người nhận    : {} ({})
                Tiêu đề       : {}
                Mã đơn hàng   : #{}
                Địa chỉ giao  : {}
                Thanh toán    : {}
                Tổng tiền     : {} ₫
                Số sản phẩm   : {} mặt hàng
                Thời gian đặt : {}
                ========================================================================================
                """,
                recipient, order.receiverName(), order.receiverPhone(), subject,
                order.id(), order.shippingAddress(), payLabel,
                formatVnd(order.totalAmount()), order.items().size(),
                order.createdAt() != null ? order.createdAt().format(DATE_FORMATTER) : "Vừa xong"
        );
    }

    private String buildOrderEmailHtml(OrderResponse order) {
        String payLabel = order.paymentMethod() == PaymentMethod.COD
                ? "Thanh toán khi nhận hàng (COD)"
                : "Chuyển khoản qua mã QR (VietQR ngân hàng)";

        String dateStr = order.createdAt() != null ? order.createdAt().format(DATE_FORMATTER) : "Hôm nay";

        String statusLabel = "Chờ xác nhận";
        String statusBadgeStyle = "background-color: #fef3c7; color: #92400e;";
        if (order.status() == OrderStatus.CONFIRMED) {
            statusLabel = "Đã xác nhận";
            statusBadgeStyle = "background-color: #d1fae5; color: #065f46;";
        } else if (order.status() == OrderStatus.SHIPPING) {
            statusLabel = "Đang giao hàng";
            statusBadgeStyle = "background-color: #dbeafe; color: #1e40af;";
        } else if (order.status() == OrderStatus.DELIVERED) {
            statusLabel = "Đã giao hàng";
            statusBadgeStyle = "background-color: #d1fae5; color: #065f46;";
        } else if (order.status() == OrderStatus.CANCELLED) {
            statusLabel = "Đã hủy";
            statusBadgeStyle = "background-color: #fee2e2; color: #991b1b;";
        }

        StringBuilder itemsRows = new StringBuilder();
        for (OrderResponse.OrderItemResponse item : order.items()) {
            itemsRows.append(String.format("""
                <tr>
                    <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b; font-weight: 500;">
                        %s
                    </td>
                    <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #475569; text-align: center;">
                        %d
                    </td>
                    <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #475569; text-align: right;">
                        %s ₫
                    </td>
                    <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #d7263d; font-weight: 600; text-align: right;">
                        %s ₫
                    </td>
                </tr>
            """,
                    escapeHtml(item.productName()),
                    item.quantity(),
                    formatVnd(item.unitPrice()),
                    formatVnd(item.lineTotal())
            ));
        }

        String tfootRows;
        if (order.discountAmount() != null && order.discountAmount().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal subtotal = order.totalAmount().add(order.discountAmount());
            tfootRows = String.format("""
                <tr>
                    <td colspan="3" style="padding: 10px 10px 4px 10px; text-align: right; color: #64748b; font-size: 13.5px; border-top: 2px solid #cbd5e1;">
                        Tạm tính:
                    </td>
                    <td style="padding: 10px 10px 4px 10px; text-align: right; font-weight: 600; font-size: 14px; color: #334155; border-top: 2px solid #cbd5e1;">
                        %s ₫
                    </td>
                </tr>
                <tr>
                    <td colspan="3" style="padding: 4px 10px 10px 10px; text-align: right; color: #059669; font-size: 13.5px;">
                        Mã giảm giá (%s):
                    </td>
                    <td style="padding: 4px 10px 10px 10px; text-align: right; font-weight: 600; font-size: 14px; color: #059669;">
                        - %s ₫
                    </td>
                </tr>
                <tr>
                    <td colspan="3" style="padding: 12px 10px; text-align: right; font-weight: bold; font-size: 15px; color: #0f172a; border-top: 1px solid #e2e8f0;">
                        TỔNG CỘNG THANH TOÁN:
                    </td>
                    <td style="padding: 12px 10px; text-align: right; font-weight: 800; font-size: 17px; color: #d7263d; border-top: 1px solid #e2e8f0;">
                        %s ₫
                    </td>
                </tr>
            """, formatVnd(subtotal), escapeHtml(order.voucherCode()), formatVnd(order.discountAmount()), formatVnd(order.totalAmount()));
        } else {
            tfootRows = String.format("""
                <tr>
                    <td colspan="3" style="padding: 14px 10px; text-align: right; font-weight: bold; font-size: 15px; color: #0f172a; border-top: 2px solid #cbd5e1;">
                        TỔNG CỘNG THANH TOÁN:
                    </td>
                    <td style="padding: 14px 10px; text-align: right; font-weight: 800; font-size: 17px; color: #d7263d; border-top: 2px solid #cbd5e1;">
                        %s ₫
                    </td>
                </tr>
            """, formatVnd(order.totalAmount()));
        }

        // Khối mã QR nếu thanh toán chuyển khoản
        String qrSection = "";
        if (order.paymentMethod() == PaymentMethod.BANK_TRANSFER) {
            String memo = "DH" + order.id();
            String qrImgUrl = "https://img.vietqr.io/image/MB-0399888999-compact2.png?amount="
                    + order.totalAmount() + "&addInfo=" + memo + "&accountName=NHOM%2016%20PHONE%20STORE";

            qrSection = String.format("""
                <div style="margin-top: 25px; padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center;">
                    <h3 style="margin: 0 0 10px 0; color: #4b3bff; font-size: 16px;">📱 Thông Tin Thanh Toán Mã QR (VietQR)</h3>
                    <p style="margin: 0 0 15px 0; color: #64748b; font-size: 13px;">Quét mã QR dưới đây bằng ứng dụng ngân hàng bất kỳ để thanh toán cho đơn hàng:</p>
                    <img src="%s" alt="Mã QR thanh toán đơn hàng" style="max-width: 220px; height: auto; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 12px;" />
                    <table style="width: 100%%; max-width: 400px; margin: 0 auto; text-align: left; font-size: 13px; color: #334155;">
                        <tr><td style="padding: 4px 0; color: #64748b;">Ngân hàng:</td><td style="font-weight: 600;">MB Bank (Ngân hàng Quân Đội)</td></tr>
                        <tr><td style="padding: 4px 0; color: #64748b;">Số tài khoản:</td><td style="font-weight: bold; color: #4b3bff;">0399888999</td></tr>
                        <tr><td style="padding: 4px 0; color: #64748b;">Chủ tài khoản:</td><td style="font-weight: 600;">NHOM 16 PHONE STORE</td></tr>
                        <tr><td style="padding: 4px 0; color: #64748b;">Số tiền:</td><td style="font-weight: bold; color: #d7263d;">%s ₫</td></tr>
                        <tr><td style="padding: 4px 0; color: #64748b;">Nội dung CK:</td><td style="font-weight: bold; color: #0f172a;">%s</td></tr>
                    </table>
                </div>
            """, qrImgUrl, formatVnd(order.totalAmount()), memo);
        }

        String noteSection = (order.note() != null && !order.note().isBlank())
                ? String.format("<p style=\"margin: 6px 0; font-size: 13px; color: #64748b;\"><strong>Ghi chú đơn hàng:</strong> %s</p>", escapeHtml(order.note()))
                : "";

        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Xác nhận đơn hàng #%d</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
                    <tr>
                        <td align="center">
                            <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="max-width: 650px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
                                <!-- HEADER -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #0f172a 0%%, #312e81 100%%); padding: 30px 25px; text-align: center;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 1px;">AURA PHONESTORE</h1>
                                        <p style="margin: 6px 0 0 0; color: #c7d2fe; font-size: 13px;">Hệ Thống Phân Phối Smartphone & Công Nghệ Chính Hãng</p>
                                    </td>
                                </tr>

                                <!-- THÔNG BÁO XÁC NHẬN -->
                                <tr>
                                    <td style="padding: 25px 30px 15px 30px;">
                                        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                                            <h2 style="margin: 0 0 6px 0; color: #065f46; font-size: 17px; font-weight: bold;"> Đặt hàng thành công!</h2>
                                            <p style="margin: 0; color: #047857; font-size: 13.5px; line-height: 1.5;">
                                                Cảm ơn <strong>%s</strong> đã mua sắm tại AURA STORE. Đơn hàng <strong>#%d</strong> của quý khách đã được tiếp nhận và đang được bộ phận kho chuẩn bị.
                                            </p>
                                        </div>

                                        <!-- THÔNG TIN GIAO HÀNG -->
                                        <table width="100%%" style="margin-bottom: 25px; font-size: 13.5px; line-height: 1.6; color: #334155;">
                                            <tr>
                                                <td style="vertical-align: top; width: 50%%; padding-right: 15px;">
                                                    <h3 style="margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Thông tin nhận hàng</h3>
                                                    <p style="margin: 0; font-weight: 600; color: #0f172a;">%s</p>
                                                    <p style="margin: 3px 0; color: #475569;">📞 %s</p>
                                                    <p style="margin: 3px 0; color: #475569;">✉️ %s</p>
                                                    <p style="margin: 3px 0; color: #475569;">📍 %s</p>
                                                    %s
                                                </td>
                                                <td style="vertical-align: top; width: 50%%; padding-left: 15px; border-left: 1px solid #f1f5f9;">
                                                    <h3 style="margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Chi tiết đơn hàng</h3>
                                                    <p style="margin: 0; color: #475569;">Mã đơn: <strong style="color: #4b3bff;">#%d</strong></p>
                                                    <p style="margin: 3px 0; color: #475569;">Thời gian: <strong>%s</strong></p>
                                                    <p style="margin: 3px 0; color: #475569;">Thanh toán: <strong style="color: #0f172a;">%s</strong></p>
                                                    <p style="margin: 3px 0; color: #475569;">Trạng thái: <span style="%s padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 600;">%s</span></p>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- DANH SÁCH SẢN PHẨM -->
                                        <h3 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Sản phẩm trong đơn hàng</h3>
                                        <table width="100%%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 20px;">
                                            <thead>
                                                <tr style="background-color: #f8fafc;">
                                                    <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: left;">SẢN PHẨM</th>
                                                    <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; width: 50px;">SL</th>
                                                    <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: right; width: 110px;">ĐƠN GIÁ</th>
                                                    <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: right; width: 120px;">THÀNH TIỀN</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                %s
                                            </tbody>
                                            <tfoot>
                                                %s
                                            </tfoot>
                                        </table>

                                        <!-- PHẦN MÃ QR (NẾU CÓ) -->
                                        %s

                                        <!-- HỖ TRỢ & BẢO HÀNH -->
                                        <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12.5px; color: #64748b; line-height: 1.6;">
                                            <p style="margin: 0 0 5px 0;">🛡️ <strong>Chính sách:</strong> Bảo hành chính hãng 12 tháng • 1 đổi 1 trong 30 ngày nếu phát hiện lỗi phần cứng.</p>
                                            <p style="margin: 0 0 5px 0;">📞 <strong>Tổng đài hỗ trợ:</strong> 1900 8899 (8:00 - 21:30) • Email: support@aurastore.vn</p>
                                            <p style="margin: 0;">🏢 <strong>Showroom:</strong> Toà nhà Landmark 81, TP. Hồ Chí Minh</p>
                                        </div>
                                    </td>
                                </tr>

                                <!-- FOOTER -->
                                <tr>
                                    <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11.5px; color: #94a3b8;">
                                        <p style="margin: 0 0 4px 0;">Email này được gửi tự động từ hệ thống AURA PHONESTORE.</p>
                                        <p style="margin: 0;">© 2026 AURA PHONESTORE — Bản quyền thuộc về Nhóm 16.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        """,
                order.id(),
                escapeHtml(order.receiverName()), order.id(),
                escapeHtml(order.receiverName()), order.receiverPhone(), escapeHtml(order.notificationEmail()), escapeHtml(order.shippingAddress()), noteSection,
                order.id(), dateStr, payLabel, statusBadgeStyle, statusLabel,
                itemsRows.toString(),
                tfootRows,
                qrSection
        );
    }

    private static String formatVnd(BigDecimal amount) {
        if (amount == null) return "0";
        return VND_FORMAT.format(amount);
    }

    private static String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
