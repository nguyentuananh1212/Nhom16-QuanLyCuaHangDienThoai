export const vnd = (n) => (n == null ? "" : Number(n).toLocaleString("vi-VN") + "₫");
export const fmtDate = (s) =>
  s ? new Date(s).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "";

export const STATUS_LABEL = {
  PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", SHIPPING: "Đang giao",
  DELIVERED: "Đã giao", CANCELLED: "Đã huỷ",
};
// Phải khớp OrderStatus.nextStates() ở backend (backend vẫn là nơi kiểm tra cuối cùng)
export const NEXT_STATUS = {
  PENDING: ["CONFIRMED", "CANCELLED"], CONFIRMED: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["DELIVERED"], DELIVERED: [], CANCELLED: [],
};
export const PAY_LABEL = { COD: "Thanh toán tiền mặt khi nhận hàng (COD)", BANK_TRANSFER: "Chuyển khoản qua mã QR (VietQR ảo)" };
export const ROLE_LABEL = { ADMIN: "Quản trị", STAFF: "Nhân viên", CUSTOMER: "Khách hàng" };

/** Bỏ khoảng trắng thừa ở mọi trường chuỗi của form */
export function formToObject(form) {
  const o = {};
  new FormData(form).forEach((v, k) => { o[k] = typeof v === "string" ? v.trim() : v; });
  return o;
}
