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
  FilePlus2,
  Users,
  Building2,
  FolderKanban,
  ChevronDown,
  Bell,
  HelpCircle,
  LogOut,
  Settings,
  Building
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

// Menu dengan ikon sesuai nama
const menuItems = [
  { name: "Home", icon: Home },
  { name: "Approval KPR", icon: CheckSquare },
  { name: "Approval Properties", icon: Building },
  { name: "Customer List", icon: Users },
  { name: "Developer List", icon: Building2 },
  { name: "Properties List", icon: FolderKanban },
  { name: "Add Properties", icon: FilePlus2 },

]

export function AppSidebar({ activeMenu, onSelect, onLogout }: any) {
  const router = useRouter()

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
                    Admin Ahong
                  </span>
                  <span className="text-xs text-gray-400 truncate">
                    admin@satuatap.com
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
                      Admin Ahong
                    </span>
                  </p>
                  <p style={{ margin: 0, padding: 0, lineHeight: "1", fontSize: "12px", color: "#4b5563" }}>
                    Administrator
                  </p>
                  <p style={{ margin: 0, padding: 0, lineHeight: "1", fontSize: "12px", color: "#6b7280" }}>
                    admin@satuatap.com
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
              onClick={onLogout}
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
