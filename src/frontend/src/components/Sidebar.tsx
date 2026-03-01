import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart2,
  BookOpen,
  ClipboardList,
  Crown,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Shield,
  Target,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { ProStatus } from "../hooks/useProStatus";
import ThemeToggle from "./ThemeToggle";

export type SectionId =
  | "dashboard"
  | "plan"
  | "weakness"
  | "materials"
  | "analytics"
  | "subscription"
  | "practice"
  | "mock"
  | "admin";

interface SidebarProps {
  currentSection: SectionId;
  onNavigate: (section: SectionId) => void;
  onLogout: () => void;
  principalShort: string;
  proStatus: ProStatus;
  isAdmin?: boolean;
}

const NAV_ITEMS: {
  id: SectionId;
  label: string;
  icon: React.ElementType;
  proOnly?: boolean;
  adminOnly?: boolean;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "plan", label: "Today's Plan", icon: BookOpen },
  { id: "practice", label: "Practice", icon: BookOpen },
  { id: "mock", label: "Mini Mock", icon: ClipboardList },
  { id: "weakness", label: "Weakness", icon: Target },
  { id: "materials", label: "Materials", icon: Library },
  { id: "analytics", label: "Analytics", icon: BarChart2, proOnly: true },
  { id: "subscription", label: "Subscription", icon: Crown },
  { id: "admin", label: "Admin", icon: Shield, adminOnly: true },
];

const PRIMARY = "oklch(0.72 0.17 195)";

interface NavItemProps {
  item: (typeof NAV_ITEMS)[number];
  isActive: boolean;
  isPro: boolean;
  isAdmin: boolean;
  onClick: () => void;
}

function NavItem({ item, isActive, isPro, isAdmin, onClick }: NavItemProps) {
  // Hide admin-only items from non-admins
  if (item.adminOnly && !isAdmin) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative"
      style={
        isActive
          ? {
              background: "oklch(0.72 0.17 195 / 0.12)",
              color: PRIMARY,
            }
          : {
              color: "oklch(var(--muted-foreground))",
            }
      }
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.background =
            "oklch(var(--secondary))";
          (e.currentTarget as HTMLButtonElement).style.color =
            "oklch(var(--secondary-foreground))";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.background = "";
          (e.currentTarget as HTMLButtonElement).style.color =
            "oklch(var(--muted-foreground))";
        }
      }}
    >
      {/* Active indicator */}
      {isActive && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
          style={{ background: PRIMARY }}
        />
      )}

      <item.icon
        className="w-4 h-4 flex-shrink-0 transition-colors"
        style={isActive ? { color: PRIMARY } : undefined}
      />
      <span
        className="font-display font-medium text-sm"
        style={isActive ? { color: PRIMARY } : undefined}
      >
        {item.label}
      </span>

      {item.proOnly && !isPro && (
        <span
          className="ml-auto text-[10px] font-display font-bold px-1.5 py-0.5 rounded"
          style={{
            background: "oklch(0.72 0.17 195 / 0.12)",
            color: PRIMARY,
            border: "1px solid oklch(0.72 0.17 195 / 0.25)",
          }}
        >
          PRO
        </span>
      )}
    </button>
  );
}

export default function Sidebar({
  currentSection,
  onNavigate,
  onLogout,
  principalShort,
  proStatus,
  isAdmin = false,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = (section: SectionId) => {
    onNavigate(section);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col h-screen sticky top-0 w-60 flex-shrink-0"
        style={{
          background: "oklch(var(--sidebar))",
          borderRight: "1px solid oklch(var(--sidebar-border))",
        }}
      >
        {/* Logo */}
        <div
          className="px-5 py-5 flex items-center gap-2.5"
          style={{ borderBottom: "1px solid oklch(var(--sidebar-border))" }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: "oklch(0.72 0.17 195 / 0.15)",
              border: "1px solid oklch(0.72 0.17 195 / 0.35)",
            }}
          >
            <Zap className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
          </div>
          <span className="font-display font-bold text-base tracking-tight text-foreground">
            Examos
          </span>
          {proStatus.isPro && (
            <Badge
              className="ml-auto text-[9px] px-1.5 py-0.5 font-display font-bold h-auto"
              style={{
                background: "oklch(0.72 0.17 195 / 0.15)",
                color: PRIMARY,
                border: "1px solid oklch(0.72 0.17 195 / 0.3)",
              }}
            >
              PRO
            </Badge>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={currentSection === item.id}
              isPro={proStatus.isPro}
              isAdmin={isAdmin}
              onClick={() => handleNavigate(item.id)}
            />
          ))}
        </nav>

        {/* User Info at bottom */}
        <div
          className="px-3 py-4"
          style={{ borderTop: "1px solid oklch(var(--sidebar-border))" }}
        >
          {principalShort && (
            <div className="px-3 py-2 mb-2">
              <p
                className="font-mono text-xs truncate"
                style={{ color: "oklch(var(--muted-foreground))" }}
              >
                {principalShort}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="w-full justify-start font-display font-medium text-sm h-9 px-3"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            <LogOut className="w-4 h-4 mr-2.5" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile: Top header with hamburger */}
      <div
        className="lg:hidden flex items-center justify-between px-4 h-14 sticky top-0 z-30"
        style={{
          background: "oklch(var(--background) / 0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid oklch(var(--border) / 0.6)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{
              background: "oklch(0.72 0.17 195 / 0.15)",
              border: "1px solid oklch(0.72 0.17 195 / 0.3)",
            }}
          >
            <Zap className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
          </div>
          <span className="font-display font-bold text-base tracking-tight text-foreground">
            Examos
          </span>
          {proStatus.isPro && (
            <span
              className="text-[9px] font-display font-bold px-1.5 py-0.5 rounded"
              style={{
                background: "oklch(0.72 0.17 195 / 0.15)",
                color: PRIMARY,
                border: "1px solid oklch(0.72 0.17 195 / 0.25)",
              }}
            >
              PRO
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{
                background: "oklch(0.08 0.01 250 / 0.7)",
                backdropFilter: "blur(4px)",
              }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 flex flex-col"
              style={{
                background: "oklch(var(--sidebar))",
                borderRight: "1px solid oklch(var(--sidebar-border))",
              }}
            >
              {/* Header */}
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{
                  borderBottom: "1px solid oklch(var(--sidebar-border))",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{
                      background: "oklch(0.72 0.17 195 / 0.15)",
                      border: "1px solid oklch(0.72 0.17 195 / 0.35)",
                    }}
                  >
                    <Zap className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                  </div>
                  <span className="font-display font-bold text-base tracking-tight text-foreground">
                    Examos
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Nav */}
              <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {NAV_ITEMS.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    isActive={currentSection === item.id}
                    isPro={proStatus.isPro}
                    isAdmin={isAdmin}
                    onClick={() => handleNavigate(item.id)}
                  />
                ))}
              </nav>

              {/* Bottom */}
              <div
                className="px-3 py-4"
                style={{ borderTop: "1px solid oklch(var(--sidebar-border))" }}
              >
                {principalShort && (
                  <div className="px-3 py-2 mb-2">
                    <p
                      className="font-mono text-xs truncate"
                      style={{ color: "oklch(var(--muted-foreground))" }}
                    >
                      {principalShort}
                    </p>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMobileOpen(false);
                    onLogout();
                  }}
                  className="w-full justify-start font-display font-medium text-sm h-9 px-3"
                  style={{ color: "oklch(var(--muted-foreground))" }}
                >
                  <LogOut className="w-4 h-4 mr-2.5" />
                  Sign out
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Tab Bar */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-20 flex"
        style={{
          background: "oklch(var(--background) / 0.95)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid oklch(var(--border) / 0.6)",
        }}
      >
        {NAV_ITEMS.filter((item) => {
          if (item.adminOnly) return isAdmin;
          return true;
        })
          .slice(0, 5)
          .map((item) => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className="flex-1 flex flex-col items-center py-2.5 gap-1 relative"
              >
                <item.icon
                  className="w-4.5 h-4.5"
                  style={{
                    color: isActive
                      ? PRIMARY
                      : "oklch(var(--muted-foreground))",
                    width: "18px",
                    height: "18px",
                  }}
                />
                <span
                  className="text-[9px] font-display font-medium"
                  style={{
                    color: isActive
                      ? PRIMARY
                      : "oklch(var(--muted-foreground))",
                  }}
                >
                  {item.label.split(" ")[0]}
                </span>
                {isActive && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ background: PRIMARY }}
                  />
                )}
              </button>
            );
          })}
      </div>
    </>
  );
}
