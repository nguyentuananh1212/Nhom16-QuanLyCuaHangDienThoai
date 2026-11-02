"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";
import { fmtDate, vnd } from "@/lib/format";
import RequireAuth from "@/components/RequireAuth";
import { Empty, Loading, Pager, StatusTag, useLoad } from "@/components/ui";

export default function Page() {
  return <RequireAuth><Orders /></RequireAuth>;
}

function Orders() {
  const [page, setPage] = useState(0);
  const { data, loading } = useLoad(() => api("/api/orders", { query: { page } }), [page]);
  return (
    <div className="my-7">
      <h1 className="mb-4 text-2xl font-bold">Đơn hàng của tôi</h1>
      {loading && !data && <Loading />}
      {data && !data.content.length && <Empty>Bạn chưa có đơn hàng nào.</Empty>}
      {data?.content.length > 0 && (
        <>
          <div className="panel overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Mã</th><th>Ngày đặt</th><th>Tổng tiền</th><th>Trạng thái</th><th /></tr></thead>
              <tbody>
                {data.content.map((o) => (
                  <tr key={o.id}>
                    <td className="tabular-nums">#{o.id}</td><td>{fmtDate(o.createdAt)}</td>
                    <td className="tabular-nums">{vnd(o.totalAmount)}</td><td><StatusTag status={o.status} /></td>
                    <td><Link className="btn btn-sm" href={`/orders/${o.id}`}>Chi tiết</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager data={data} onChange={setPage} />
        </>
      )}
    </div>
  );
}
