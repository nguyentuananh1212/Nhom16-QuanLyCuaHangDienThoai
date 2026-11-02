package com.example.Nhom16_QuanLyCuaHangDienThoai.entity.enums;

import java.util.EnumSet;
import java.util.Set;

/**
 * Vòng đời đơn hàng. Mỗi trạng thái khai báo các trạng thái kế tiếp hợp lệ,
 * nên mọi thay đổi trạng thái đều phải đi qua {@link #canTransitionTo}.
 */
public enum OrderStatus {
    PENDING, CONFIRMED, SHIPPING, DELIVERED, CANCELLED;

    public Set<OrderStatus> nextStates() {
        return switch (this) {
            case PENDING -> EnumSet.of(CONFIRMED, CANCELLED);
            case CONFIRMED -> EnumSet.of(SHIPPING, CANCELLED);
            case SHIPPING -> EnumSet.of(DELIVERED);
            case DELIVERED, CANCELLED -> EnumSet.noneOf(OrderStatus.class);
        };
    }

    public boolean canTransitionTo(OrderStatus target) {
        return nextStates().contains(target);
    }

    /** Hàng đã trừ kho nhưng chưa giao -> huỷ thì phải hoàn kho. */
    public boolean isCancellable() {
        return this == PENDING || this == CONFIRMED;
    }
}
