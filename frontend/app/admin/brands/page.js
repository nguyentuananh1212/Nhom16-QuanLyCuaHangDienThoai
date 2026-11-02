"use client";

import SimpleCrud from "@/components/SimpleCrud";

const FIELDS = [{ name: "name", label: "Tên hãng" }, { name: "logoUrl", label: "Link logo" }, { name: "description", label: "Mô tả" }];

export default function Page() {
  return <SimpleCrud title="Hãng" endpoint="/api/brands" adminEndpoint="/api/admin/brands" fields={FIELDS} />;
}
