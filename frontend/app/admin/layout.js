import AdminShell from "./AdminShell";

export const metadata = { title: "Quản trị" };

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
