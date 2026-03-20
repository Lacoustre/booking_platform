import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import AdminHeader from "../../components/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: 'var(--ink)' }}>
      <Sidebar />
      <div className="main">
        <AdminHeader />
        <div style={{ padding: '36px 40px', flex: 1, minHeight: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}