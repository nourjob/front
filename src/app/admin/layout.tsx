// src/app/admin/layout.tsx

import React from "react";
import AdminDashboardLayout from "@/app/admin/components/layout";
import Sidebar from "@/app/admin/dashboard/components/Sidebar";
import Navbar from "@/app/admin/dashboard/components/Navbar";
import Footer from "@/app/admin/dashboard/components/Footer";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminDashboardLayout
      sidebar={<Sidebar />}
      navbar={<Navbar />}
      footer={<Footer />}
    >
      {children}
    </AdminDashboardLayout>
  );
}
