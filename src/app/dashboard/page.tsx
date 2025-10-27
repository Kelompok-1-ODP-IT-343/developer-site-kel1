'use client';

import RoleGuard from '@/components/RoleGuard';

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "@/components/mode-toggle" // 🌙 import toggle

import AnalyticsDashboard from "@/components/AnalyticsDashboard"
import ChartsSection from "@/components/ChartsSection"
import ApprovalSection from "@/components/ApprovalSection"
import ApprovalHistory from "@/components/ApprovalHistory"

export default function Dashboard() {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState("Home")
  const [currentDate, setCurrentDate] = useState(new Date())

  const renderContent = () => {
    switch (activeMenu) {
      case "Home":
          return (
            <div className="space-y-8 p-6">
              <AnalyticsDashboard />
              <ChartsSection />
            </div>
          );
      case "Approval KPR":
          return <ApprovalSection />
      case "Approval History":
        return <ApprovalHistory />
      default:
        return null
    }
  }

  return (
    <RoleGuard allowedRoles={['DEVELOPER']}>
      <SidebarProvider>
        <AppSidebar
          activeMenu={activeMenu}
          onSelect={setActiveMenu}
          onLogout={() => router.push("/login")}
        />
        <SidebarInset>
          <main className="flex-1 p-8">
            {/* HEADER */}
            <header className="flex justify-between items-center mb-8 text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <span className="font-medium">
                  {currentDate.toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>

              {/* 🌙 TOGGLE BUTTON */}
              <ModeToggle />
            </header>

            {/* DYNAMIC CONTENT */}
            {renderContent()}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
}
