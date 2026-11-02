import { Suspense } from "react";
import { Loading } from "@/components/ui";
import ProductList from "./ProductList";

export const metadata = { title: "Sản phẩm" };

// useSearchParams phải nằm trong Suspense (yêu cầu của cacheComponents khi build)
export default function Page() {
  return <Suspense fallback={<Loading />}><ProductList /></Suspense>;
}
