import { Suspense } from "react";
import { Loading } from "@/components/ui";
import OrderDetail from "./OrderDetail";

export default function Page() {
  return <Suspense fallback={<Loading />}><OrderDetail /></Suspense>;
}
