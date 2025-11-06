"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar, // ← untuk cek state collapsed/expanded
} from "@/components/ui/sidebar"
import {
  Home,
  CheckSquare,
  ListTodo,
  ChevronDown,
  Bell,
  HelpCircle,
  LogOut,
  Settings,
  HardHat
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
import { logout } from "@/services/auth"

// Menu dengan ikon sesuai nama
const menuItems = [
  { name: "Home", icon: Home },
  { name: "Approval KPR", icon: CheckSquare },
  { name: "Approval History", icon: ListTodo }
]

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

  // status collapsed/expanded dari shadcn sidebar
  const { state } = useSidebar() // "expanded" | "collapsed"
  const isCollapsed = state === "collapsed"

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
      <div className="flex flex-col items-center justify-center py-6">
        <Image
          src="/sidebar_satuatap.png"
          alt="Satu Atap"
          width={isCollapsed ? 28 : 140}
          height={isCollapsed ? 28 : 40}
          className="object-contain"
          priority
        />

        {isCollapsed ? (
          // Collapsed: hanya ikon helm (tooltip opsional via title)
          <div className="mt-2" title="For Developer">
            <HardHat className="h-5 w-5" aria-label="For Developer" />
          </div>
        ) : (
          // Expanded: ikon + teks besar
          <div className="mt-2 flex items-center gap-2 whitespace-nowrap">
            <HardHat className="h-5 w-5" aria-hidden="true" />
            <span className="text-xl font-bold tracking-wide">For Developer</span>
          </div>
        )}
      </div>

      {/* === MENU === */}
      <SidebarContent>
        <SidebarGroup>
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

          <DropdownMenuContent side="right" align="start" className="w-64 p-0">
            <DropdownMenuLabel className="px-4 py-3">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/avatars/cecilion.png"
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {loading ? "Loading..." : userProfile?.fullName || "User"}
                    </p>
                    <span className="rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] uppercase tracking-wide text-gray-700 dark:text-gray-300 px-2 py-0.5">
                      {loading ? "" : (userProfile?.roleName || "User")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
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
