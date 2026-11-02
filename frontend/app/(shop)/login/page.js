import { Suspense } from "react";
import { Loading } from "@/components/ui";
import LoginForm from "./LoginForm";

export const metadata = { title: "Đăng nhập" };

export default function Page() {
  return <Suspense fallback={<Loading />}><LoginForm /></Suspense>;
}
