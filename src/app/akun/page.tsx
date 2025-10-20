"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  ArrowLeft,
  CircleCheckBig,
  AlertTriangle,
  Info,
  OctagonAlert,
  BellDot
} from "lucide-react";

const COLORS = {
  teal: "#3FD8D4",
  gray: "#757575",
  orange: "#FF8500",
  lime: "#DDEE59",
};
type Section = "settings" | "notifications" | "help";

export default function AkunPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [active, setActive] = useState<Section>("settings");

  useEffect(() => {
    const tab = (searchParams.get("tab") || "").toLowerCase();
    if (tab === "settings" || tab === "notifications" || tab === "help") {
      setActive(tab as Section);
    }
  }, [searchParams]);

  const goLogout = () => router.push("/");
  const goBack = () => router.push("/dashboard");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9">
              <Image src="/logo-satuatap.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className="font-extrabold text-xl text-[#FF8500]">satuatap</span>
          </div>

          {/* Tombol Back */}
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-[#0B63E5] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Dashboard</span>
          </button>
        </div>
      </header>

      {/* BODY */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 pb-12 grid grid-cols-1 md:grid-cols-12 gap-6 mt-8">
          {/* SIDEBAR */}
          <aside className="md:col-span-4 lg:col-span-3">
            <div className="rounded-2xl bg-white border shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-5 border-b">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src="/images/avatars/cecilion.png"
                    alt="Admin Ahong"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 leading-tight">
                    Admin Ahong
                  </h3>
                  <p className="text-xs text-gray-500 -mt-0.5">Administrator</p>
                </div>
              </div>

              {/* Menu Items */}
              <SidebarItem
                active={active === "settings"}
                title="Account Settings"
                icon={<Settings className="h-5 w-5" />}
                onClick={() => router.push("/akun?tab=settings")}
              />
              <SidebarItem
                active={active === "notifications"}
                title="Notifications"
                icon={<Bell className="h-5 w-5" />}
                onClick={() => router.push("/akun?tab=notifications")}
              />
              <SidebarItem
                active={active === "help"}
                title="Help"
                icon={<HelpCircle className="h-5 w-5" />}
                onClick={() => router.push("/akun?tab=help")}
              />

              <div className="h-px bg-gray-100 mx-4" />

              <button
                onClick={goLogout}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3 text-red-500">
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Log out</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </aside>

          {/* CONTENT */}
          <section className="md:col-span-8 lg:col-span-9">
            <div className="rounded-2xl bg-white border shadow-sm p-6 space-y-12">
              {active === "settings" && <SettingsContent />}
              {active === "notifications" && <NotificationsContent />}
              {active === "help" && <HelpContent />}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* Sidebar Item */
function SidebarItem({
  title,
  icon,
  onClick,
  active,
}: {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-5 py-4 transition ${
        active ? "bg-[#F5FAFF]" : "hover:bg-gray-50"
      }`}
    >
      <div
        className={`flex items-center gap-3 ${
          active ? "text-[#0B63E5]" : "text-gray-800"
        }`}
      >
        <div
          className={`h-9 w-9 grid place-items-center rounded-xl ${
            active ? "bg-[#EAF2FF]" : "bg-gray-100"
          }`}
        >
          {icon}
        </div>
        <span className="font-medium">{title}</span>
      </div>
      <ChevronRight
        className={`h-4 w-4 ${active ? "text-[#0B63E5]" : "text-gray-400"}`}
      />
    </button>
  );
}

/* Content */
function SettingsContent() {
  return (
    <div className="akun w-full">
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        {/* --- Account Info --- */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your personal information here. Click save when finished.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-3">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="Admin Ahong" />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="admin@satuatap.com" />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue="ahong123" />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" defaultValue="+62 812 3456 7890" />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="position">Position</Label>
                <Input id="position" defaultValue="Administrator" />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="department">Department</Label>
                <Input id="department" defaultValue="Digital Lending Division" />
              </div>
            </CardContent>

            <CardFooter>
              <Button className="ml-auto bg-[#0B63E5] hover:bg-[#094ec1]">
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* --- Password Change --- */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password. After saving, you may need to log in again.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" placeholder="••••••••" />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" placeholder="••••••••" />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" />
              </div>
            </CardContent>

            <CardFooter>
              <Button className="ml-auto bg-[#0B63E5] hover:bg-[#094ec1]">
                Save Password
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationsContent() {
  // Dummy data (selalu unread tiap render)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Operation Successful",
      desc: "Property has been successfully added to the listing.",
      type: "success",
      read: false,
    },
    {
      id: 2,
      title: "Operation Successful",
      desc: "Customer approval process completed successfully.",
      type: "success",
      read: false,
    },
    {
      id: 3,
      title: "Proceed with Caution",
      desc: "This action might have unintended consequences. Double-check your decision before proceeding.",
      type: "warning",
      read: false,
    },
    {
      id: 4,
      title: "Important Information",
      desc: "Make sure to review the recent platform updates before submitting a new property.",
      type: "info",
      read: false,
    },
    {
      id: 5,
      title: "Something Went Wrong",
      desc: "An error occurred while processing your request. Please try again later.",
      type: "error",
      read: false,
    },
  ]);

  // hanya efek visual di runtime, tapi tidak disimpan
  const handleClick = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getStyle = (type: string) => {
    switch (type) {
      case "success":
        return {
          border: "border-emerald-400",
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          icon: <CircleCheckBig className="size-4 text-emerald-600" />,
        };
      case "warning":
        return {
          border: "border-amber-400",
          bg: "bg-amber-50",
          text: "text-amber-700",
          icon: <AlertTriangle className="size-4 text-amber-600" />,
        };
      case "info":
        return {
          border: "border-cyan-400",
          bg: "bg-cyan-50",
          text: "text-cyan-700",
          icon: <Info className="size-4 text-cyan-600" />,
        };
      case "error":
        return {
          border: "border-red-400",
          bg: "bg-red-50",
          text: "text-red-700",
          icon: <OctagonAlert className="size-4 text-red-600" />,
        };
      default:
        return {
          border: "border-gray-300",
          bg: "bg-gray-50",
          text: "text-gray-700",
          icon: <Info className="size-4 text-gray-500" />,
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* --- Header --- */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <BellDot className="size-5 text-cyan-600" />
          Notifications
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="text-sm border-cyan-500 text-cyan-700 hover:bg-cyan-50 transition-colors"
          onClick={() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
          }
        >
          Mark all as read
        </Button>
      </div>

      {/* --- Notifications List --- */}
      <div className="space-y-3">
        {notifications.map((notif) => {
          const style = getStyle(notif.type);
          return (
            <div
              key={notif.id}
              onClick={() => handleClick(notif.id)}
              className={`relative flex items-start gap-3 cursor-pointer p-4 rounded-xl transition-all duration-200 
                hover:shadow-sm hover:scale-[1.01] border ${style.border} ${style.bg} ${style.text}`}
            >
              {/* Icon */}
              <div className="mt-1">{style.icon}</div>

              {/* Content */}
              <div className="flex-1">
                <AlertTitle className="font-semibold">
                  {notif.title}
                </AlertTitle>
                <AlertDescription className="text-sm leading-snug">
                  {notif.desc}
                </AlertDescription>
              </div>

              {/* 🔵 Unread Dot */}
              {!notif.read && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 size-3 bg-cyan-500 rounded-full shadow-sm ring-2 ring-white"></span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


function HelpContent() {
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-[#0B63E5] mb-2">
          Help Center
        </h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          Panduan untuk administrator{" "}
          <span className="font-semibold text-[#FF8500]">Satu Atap</span>.  
          Jika masih mengalami kendala, hubungi tim support di{" "}
          <span className="font-semibold text-[#0B63E5]">
            support@satuatap.com
          </span>.
        </p>
      </div>

      {/* ACCORDION */}
      <Accordion
        type="single"
        collapsible
        className="w-full divide-y divide-gray-200 rounded-xl border border-gray-200 bg-gradient-to-b from-white to-[#fafafa] shadow-sm"
        defaultValue="item-1"
      >
        {[
          {
            id: "1",
            q: "Bagaimana cara menambahkan properti baru?",
            a: "Masuk ke menu Properties → Add New Property di dashboard admin. Lengkapi data properti seperti developer, tipe, harga, dan gambar. Tekan Save untuk menyimpan.",
          },
          {
            id: "2",
            q: "Bagaimana mengelola data developer?",
            a: "Gunakan halaman Developers untuk menambah, mengedit, atau menghapus developer. Pastikan data sesuai dengan daftar rekanan resmi BNI.",
          },
          {
            id: "3",
            q: "Bagaimana proses approval pengajuan KPR?",
            a: "Masuk ke Customer Applications, buka detail pengajuan, dan periksa kelengkapan dokumen. Tekan Approve atau Reject sesuai hasil verifikasi.",
          },
          {
            id: "4",
            q: "Bagaimana cara memperbarui data pengguna admin?",
            a: "Buka Account Settings → Account untuk memperbarui nama, email, atau jabatan. Klik Save Changes untuk menyimpan perubahan.",
          },
          {
            id: "5",
            q: "Apa yang harus dilakukan jika sistem error atau tidak bisa login?",
            a: "Coba refresh halaman. Jika tetap error, kirim laporan ke support@satuatap.com dengan screenshot dan waktu kejadian.",
          },
          {
            id: "6",
            q: "Bagaimana menjaga keamanan data nasabah?",
            a: "Gunakan jaringan internal BNI dan jangan bagikan kredensial admin. Semua aktivitas tercatat di audit log.",
          },
        ].map((item) => (
          <AccordionItem key={item.id} value={`item-${item.id}`}>
            <AccordionTrigger
              className="text-[15px] font-semibold text-gray-900 hover:text-[#0B63E5] px-6 py-4 transition-colors"
            >
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-gray-700 px-6 pb-5 text-sm leading-relaxed bg-[#fcfcfc]">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}



/* Helpers */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="block text-sm text-gray-500 mb-1">{label}</span>
      <input
        defaultValue={value}
        className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3FD8D4]"
      />
    </label>
  );
}
