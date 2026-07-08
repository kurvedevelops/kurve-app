"use client";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { Menu, X } from "lucide-react";
import { useCurrentUser } from "@/hooks/middleware";

interface NavSection {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}

interface SidebarBaseProps {
  logo?: string;
  headerComponent?: ReactNode;
  navSections: NavSection[];
  userAvatar: string;
  userName: string;
  userRole: string;
  showLogout?: boolean;
}

const SidebarBase = ({
  logo = "/kurve-icon.png",
  headerComponent,
  navSections,
  userAvatar,
  userName,
  userRole,
  showLogout = true,
}: SidebarBaseProps) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loadingUser } = useCurrentUser();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    await Swal.fire({
      title: "Sesión cerrada",
      text: "Has cerrado sesión correctamente.",
      icon: "success",
      confirmButtonColor: "#76B041",
    });
    router.push("/");
  };

  const role = user?.role;

  const handleDashboardClick = () => {
    router.push(`/${role}`);
  };

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between z-40">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-azul-kurve hover:text-foreground transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Image
          src={logo}
          alt="Logo"
          width={40}
          height={40}
          priority
          className="w-auto h-8 cursor-pointer"
          onClick={handleDashboardClick}
        />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-verde-kurve flex items-center justify-center text-white font-bold text-xs">
            {userAvatar}
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-13 left-0 right-0 bg-background border-b border-border z-30 max-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="p-4 flex flex-col gap-4">
            {/* Navigation */}
            <nav className="flex flex-col gap-4">
              {navSections.map((section, index) => (
                <div key={index}>
                  <p className="uppercase font-bold text-[12px] mb-2 text-gris-kurve-dark px-2">
                    {section.title}
                  </p>
                  <div className="flex flex-col gap-1">
                    {section.links.map((link, linkIndex) => (
                      <Link
                        key={linkIndex}
                        href={link.href}
                        className="py-2 px-3 rounded-lg hover:bg-muted transition-colors text-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            {/* User Info Mobile */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-3 p-3 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-verde-kurve flex items-center justify-center text-white font-bold text-sm">
                  {userAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-gris-kurve-dark truncate">
                    {userRole}
                  </p>
                </div>
              </div>

              {showLogout && (
                <button
                  onClick={handleLogout}
                  className="w-full mt-3 px-4 py-2 text-sm font-medium text-white bg-verde-kurve rounded-lg hover:bg-verde-kurve-dark transition-colors"
                >
                  Cerrar sesión
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 md:w-45 lg:w-64 h-screen bg-background text-azul-kurve flex-col py-8 p-2 lg:px-4 transition-all duration-300 overflow-y-auto">
        {/* Logo */}
        <Image
          src={logo}
          alt="Logo"
          width={100}
          height={100}
          priority
          className="mb-6 ml-3 cursor-pointer"
          onClick={handleDashboardClick}
        />

        {/* Header Component (Optional) */}
        {headerComponent && <div className="mb-6">{headerComponent}</div>}

        {/* Navigation */}
        <nav className="flex flex-col gap-4 ml-3 flex-1">
          {navSections.map((section, index) => (
            <div key={index}>
              <p className="uppercase font-bold text-[13px] mb-2 text-gris-kurve-dark">
                {section.title}
              </p>
              <div className="flex flex-col">
                {section.links.map((link, linkIndex) => (
                  <Link
                    key={linkIndex}
                    href={link.href}
                    className="py-2 pl-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="mt-auto pt-4 cursor-default">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-gris-kurve-light hover:bg-muted transition-colors">
            {/* Avatar */}
            <div className="hidden w-10 h-10 rounded-full bg-verde-kurve lg:flex items-center justify-center text-white font-bold text-sm">
              {userAvatar}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {userName}
              </p>
              <p className="text-xs text-gris-kurve-dark truncate">
                {userRole}
              </p>
            </div>

            {/* Logout Button */}
            {showLogout && (
              <button
                className="text-gris-kurve-dark hover:text-foreground transition-colors cursor-pointer"
                onClick={handleLogout}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="hover:scale-130 hover:rotate-5 transition-transform"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 4.75C5 3.78 5.78 3 6.75 3H13.25C14.22 3 15 3.78 15 4.75V19.25C15 20.22 14.22 21 13.25 21H6.75C5.78 21 5 20.22 5 19.25V4.75Z"
                    stroke="#1F3B45"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11 12H21"
                    stroke="#76B041"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M17 8L21 12L17 16"
                    stroke="#76B041"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 8H11"
                    stroke="#1F3B45"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarBase;
