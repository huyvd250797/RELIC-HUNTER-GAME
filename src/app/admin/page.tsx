import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: `Admin | ${profile.name}`,
  description: "Portfolio CMS Admin with Supabase content editing, analytics and visitor insights.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
