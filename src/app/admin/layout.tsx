"use client";

import React from "react";
import Sidebar from "@/app/admin/dashboard/components/Sidebar";
import Navbar from "@/app/admin/dashboard/components/Navbar";
import Footer from "@/app/admin/dashboard/components/Footer";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-gray-100">
      {/* ✅ Sidebar */}
      <aside className="w-64">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col">
        {/* ✅ Navbar */}
        <Navbar />

        {/* ✅ Main Content */}
        <main className="flex-1 p-6">{children}</main>

        {/* ✅ Footer */}
        <Footer />
      </div>
    </div>
  );
}
