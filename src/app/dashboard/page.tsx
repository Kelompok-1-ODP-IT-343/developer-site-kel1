'use client';

import RoleGuard from '@/components/RoleGuard';

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "@/components/mode-toggle" // 🌙 import toggle

import dynamic from "next/dynamic"
// Dynamic import to ensure Recharts (client-only) chunks are loaded on client, preventing ENOENT vendor chunk errors.
const AnalyticsDashboard = dynamic(() => import("@/components/AnalyticsDashboard"), { ssr: false })
const ChartsSection = dynamic(() => import("@/components/ChartsSection"), { ssr: false })
import ApprovalSection from "@/components/ApprovalSection"
import ApprovalHistory from "@/components/ApprovalHistory"

export default function Dashboard() {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState("Home")
  // Avoid SSR/client hydration mismatch by rendering date only after mount
  const [currentDate, setCurrentDate] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Set once on mount; no interval to avoid resource usage
    setCurrentDate(new Date())
  }, [])

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
                {/* Render nothing on the server and until mounted to prevent hydration mismatch */}
                {mounted && currentDate ? (
                  <span className="font-medium" suppressHydrationWarning>
                    {currentDate.toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                ) : (
                  <span className="font-medium" aria-hidden="true">&nbsp;</span>
                )}
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
