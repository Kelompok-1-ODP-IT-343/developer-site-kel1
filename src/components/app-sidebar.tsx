"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Home,
  CheckSquare,
  ListTodo,
  ChevronDown,
  Bell,
  HelpCircle,
  LogOut,
  Settings
} from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import { getUserProfile } from "@/lib/coreApi"

// Menu dengan ikon sesuai nama
const menuItems = [
  { name: "Home", icon: Home },
  { name: "Approval KPR", icon: CheckSquare },
  { name: "Approval History", icon: ListTodo }
]

import { logout } from "@/services/auth"

interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  roleName: string;
  status: string;
  monthlyIncome: number;
  occupation?: string;
  companyName?: string;
}

interface AppSidebarProps {
  activeMenu: string;
  onSelect: (menu: string) => void;
  onLogout?: () => void;
}

export function AppSidebar({ activeMenu, onSelect, onLogout }: AppSidebarProps) {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getUserProfile()
        if (response.success) {
          setUserProfile(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  return (
    <Sidebar collapsible="icon">
      {/* === HEADER LOGO === */}
      <div className="flex items-center justify-center py-6">
        <Image
          src="/sidebar_satuatap.png"
          alt="Satu Atap"
          width={140}
          height={40}
          className="object-contain"
        />
      </div>

      {/* === MENU === */}
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Menu</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => onSelect(item.name)}
                      className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-all duration-150
                        ${
                          activeMenu === item.name
                            ? "bg-gray-200 text-gray-900 font-semibold shadow-sm scale-[1.02]"
                            : "text-gray-600 hover:bg-gray-100 hover:scale-[1.01]"
                        }`}
                    >
                      <item.icon className="h-8 w-8" />
                      <span className="text-[16px]">{item.name}</span>
                    </button>

                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* === PROFILE DROPDOWN === */}
      <SidebarFooter className="pb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <Image
                  src="/images/avatars/cecilion.png"
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full flex-shrink-0"
                />
                <div className="flex flex-col text-left truncate">
                  <span className="text-sm font-semibold text-sidebar-foreground truncate">
                    {loading ? "Loading..." : userProfile?.fullName || "User"}
                  </span>
                  <span className="text-xs text-gray-400 truncate">
                    {loading ? "Loading..." : userProfile?.email || "user@example.com"}
                  </span>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="right" align="start" className="w-56">
            <DropdownMenuLabel>
              <div className="flex items-start gap-2">
                <Image
                  src="/images/avatars/cecilion.png"
                  alt="Profile"
                  width={36}
                  height={36}
                  className="rounded-full"
                />
                <div
                  className="text-gray-700"
                  style={{ lineHeight: "1", margin: "0", padding: "0" }}
                >
                  <p style={{ margin: 0, padding: 0, lineHeight: "1", fontSize: "12px" }}>
                    <span style={{ fontWeight: 600, color: "#374151" }}>
                      {loading ? "Loading..." : userProfile?.fullName || "User"}
                    </span>
                  </p>
                  <p style={{ margin: 0, padding: 0, lineHeight: "1", fontSize: "12px", color: "#4b5563" }}>
                    {loading ? "Loading..." : userProfile?.roleName || "User"}
                  </p>
                  <p style={{ margin: 0, padding: 0, lineHeight: "1", fontSize: "12px", color: "#6b7280" }}>
                    {loading ? "Loading..." : userProfile?.email || "user@example.com"}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/akun?tab=settings")}>
              <Settings className="mr-2 h-4 w-4" /> Account Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/akun?tab=notifications")}>
              <Bell className="mr-2 h-4 w-4" /> Notifications
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/akun?tab=help")}>
              <HelpCircle className="mr-2 h-4 w-4" /> Help
            </DropdownMenuItem>


            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                try {
                  const result = await logout();
                  if (result.success) {
                    if (onLogout) {
                      onLogout();
                    } else {
                      router.push('/login');
                    }
                  } else {
                    console.error('Logout failed:', result.message);
                  }
                } catch (error) {
                  console.error('Logout error:', error);
                  router.push('/login');
                }
              }}
              className="text-red-500 focus:text-red-500"
            >
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
