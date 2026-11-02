import { Suspense } from "react";
import { Loading } from "@/components/ui";
import ProductDetail from "./ProductDetail";

export default function Page() {
  return <Suspense fallback={<Loading />}><ProductDetail /></Suspense>;
}
