"use client";
import Link from "next/link";
import { ReactNode } from "react";
import { Plus } from "lucide-react";

interface NavItem {
  label: string;
  icon: ReactNode;
  href: string;
  isFab?: boolean;
}

interface BottomNavProps {
  items: NavItem[];
  onFabClick?: () => void;
}

const BottomNav = ({ items, onFabClick }: BottomNavProps) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border flex items-center justify-around py-3 z-40">
      {items.map((item, index) => (
        <div key={index}>
          {item.isFab ? (
            <button
              onClick={onFabClick}
              className="flex items-center justify-center w-14 h-14 bg-verde-kurve text-white rounded-full -mt-6 hover:bg-verde-kurve-dark transition-colors shadow-lg"
            >
              {item.icon}
            </button>
          ) : (
            <Link
              href={item.href}
              className="flex flex-col items-center gap-1 text-gris-kurve-dark hover:text-foreground transition-colors"
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default BottomNav;
