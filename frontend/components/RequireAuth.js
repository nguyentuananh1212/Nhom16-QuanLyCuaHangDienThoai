"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/Providers";
import { Loading } from "@/components/ui";

/**
 * Chặn trang cần đăng nhập ở phía giao diện (chỉ để điều hướng cho đúng).
 * Quyền thật luôn do backend kiểm tra qua JWT.
 */
export default function RequireAuth({ staff = false, children }) {
  const { ready, user, isStaff } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const allowed = !!user && (!staff || isStaff);

  useEffect(() => {
    if (!ready || allowed) return;
    if (!user) router.replace("/login?next=" + encodeURIComponent(pathname));
    else router.replace("/"); // đã đăng nhập nhưng không phải nhân viên
  }, [ready, allowed, user, router, pathname]);

  if (!ready || !allowed) return <Loading />;
  return children;
}
