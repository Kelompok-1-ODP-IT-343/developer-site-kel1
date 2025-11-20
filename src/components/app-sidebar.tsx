"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  CheckSquare,
  ListTodo,
  ChevronDown,
  Bell,
  HelpCircle,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { getUserProfile } from "@/lib/coreApi";
import { logout } from "@/services/auth";

// Menu items
const menuItems = [
  { name: "Home", icon: Home },
  { name: "Approval KPR", icon: CheckSquare },
  { name: "Approval History", icon: ListTodo },
];

function getAvatarColor(name: string): string {
  const colors = [
    "#3FD8D4", // teal
    "#FF8500", // orange
    "#0B63E5", // blue
    "#DDEE59", // lime
    "#00C49F", // emerald
  ];
  const index =
    name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
}

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
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);


  // Collapsed state from shadcn sidebar
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getUserProfile();
        if (response.success) setUser(response.data);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  // Build initials from full name, e.g., "Branch Managerooo" -> "BM"
  const getInitials = (name: string) => {
    const n = (name || "").trim();
    if (!n) return "U";
    const parts = n.split(/\s+/);
    if (parts.length === 1) {
      const p = parts[0];
      return p.slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayName = loading ? "" : userProfile?.fullName || "User";
  const initials = getInitials(displayName);

  return (
    <Sidebar collapsible="icon">
      {/* Header with dynamic logo */}
      <div className="flex flex-col items-center justify-center py-6">
        <Image
          src="/sidebar_satuatap.png"
          alt="Satu Atap"
          width={isCollapsed ? 28 : 140}
          height={isCollapsed ? 28 : 40}
          className="object-contain transition-all duration-200"
          priority
        />
        {isCollapsed ? (
          <div className="mt-2" title="For Staff">
            <User className="h-5 w-5" aria-label="For Staff" />
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-2 whitespace-nowrap">
            <User className="h-5 w-5" aria-hidden="true" />
            <span className="text-xl font-bold tracking-wide">For Staff</span>
          </div>
        )}
      </div>

      {/* Menu */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => onSelect(item.name)}
                      className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-all duration-150 ${
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

      {/* Profile dropdown */}
      {/* === FOOTER USER PROFILE & LOGOUT === */}
      <SidebarFooter className="pb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                {/* === Avatar === */}
                {user?.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt={user.fullName || "User"}
                    width={32}
                    height={32}
                    className="rounded-full flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-8 h-8 flex items-center justify-center rounded-full text-white text-xs font-semibold shadow-sm"
                    style={{
                      backgroundColor: getAvatarColor(user?.fullName || user?.roleName || "U"),
                    }}
                  >
                    {user?.fullName
                      ? user.fullName
                          .split(" ")
                          .slice(0, 2)
                          .map((w: string) => w[0])
                          .join("")
                          .toUpperCase()
                      : "U"}
                  </div>
                )}

                {/* === User Info === */}
                <div className="flex flex-col text-left truncate">
                  <span className="text-xs font-medium text-sidebar-foreground truncate">
                    {user?.fullName || "-"}
                  </span>
                  <span className="text-[10px] text-gray-400 truncate">
                    {user?.email || "-"}
                  </span>
                </div>
              </div>

              <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="right" align="start" className="w-56">
            <DropdownMenuLabel>
              <div className="flex items-start gap-2">
                {user?.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt="Profile"
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                ) : (
                  <div
                    className="w-9 h-9 flex items-center justify-center rounded-full text-white text-xs font-semibold shadow-sm"
                    style={{
                      backgroundColor: getAvatarColor(user?.fullName || user?.roleName || "U"),
                    }}
                  >
                    {user?.fullName
                      ? user.fullName
                          .split(" ")
                          .slice(0, 2)
                          .map((w: string) => w[0])
                          .join("")
                          .toUpperCase()
                      : "U"}
                  </div>
                )}

                {/* ubah bagian text ini */}
                <div
                  className="text-gray-700"
                  style={{ lineHeight: "1", margin: "0", padding: "0" }}
                >
                  <p style={{ margin: 0, padding: 0, lineHeight: "1", fontSize: "12px" }}>
                    <span style={{ fontWeight: 600, color: "#374151" }}>
                      {user?.fullName || "-"}
                    </span>
                  </p>
                  <p style={{ margin: 0, padding: 0, lineHeight: "1", fontSize: "12px", color: "#4b5563" }}>
                    {user?.roleName || "Administrator"}
                  </p>
                  <p style={{ margin: 0, padding: 0, lineHeight: "1", fontSize: "12px", color: "#6b7280" }}>
                    {user?.email || "-"}
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
                  await logout();
                } catch (err) {
                  console.error('Logout failed', err);
                }
                if (typeof onLogout === 'function') {
                  try {
                    onLogout();
                  } catch (e) {
                    console.error('onLogout handler threw', e);
                  }
                } else {
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
  );
}
