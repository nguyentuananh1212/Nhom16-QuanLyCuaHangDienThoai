"use client";

import SimpleCrud from "@/components/SimpleCrud";

const FIELDS = [{ name: "name", label: "Tên phân khúc" }, { name: "description", label: "Mô tả" }];

export default function Page() {
  return <SimpleCrud title="Phân khúc" endpoint="/api/categories" adminEndpoint="/api/admin/categories" fields={FIELDS} />;
}
