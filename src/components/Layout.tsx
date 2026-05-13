import { Link, useRouterState, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, FileText, BarChart3, Settings as SettingsIcon } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/content", label: "Content", icon: FileText },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

const configNav = [{ to: "/settings", label: "Settings", icon: SettingsIcon }];

export function Sidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string, exact?: boolean) => {
    if (exact) return path === to;
    if (to === "/content" && path.startsWith("/editor")) return true;
    return path === to || path.startsWith(to + "/");
  };

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 flex flex-col"
      style={{ width: 240, background: "var(--sidebar-bg)" }}
    >
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid #E2E6EF" }}>
        <div style={{ color: "#1B2B4B", fontSize: 15, fontWeight: 500 }}>Otto Help Center</div>
        <div style={{ color: "#8A96AA", fontSize: 11, marginTop: 2 }}>Admin Panel</div>
      </div>

      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {nav.map((item) => {
          const active = isActive(item.to, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md mb-0.5 transition-colors relative"
              style={{
                fontSize: 13,
                color: active ? "#1B2B4B" : "#5A7099",
                background: active ? "#FFFFFF" : "transparent",
                border: active ? "1px solid #E2E6EF" : "1px solid transparent",
                borderLeft: active ? "2px solid #E5635A" : "2px solid transparent",
                paddingLeft: active ? 10 : 12,
                fontWeight: active ? 500 : 400,
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.color = "#1B2B4B";
                  e.currentTarget.style.background = "#FFFFFF";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.color = "#5A7099";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <Icon size={15} strokeWidth={1.75} />
              <span className="flex-1">{item.label}</span>
              {"hasBadge" in item && item.hasBadge && unread > 0 && (
                <span
                  className="text-white font-medium"
                  style={{
                    background: "#E5635A",
                    fontSize: 10,
                    padding: "1px 6px",
                    borderRadius: 10,
                    lineHeight: "14px",
                  }}
                >
                  {unread}
                </span>
              )}
            </Link>
          );
        })}

        <div
          className="uppercase tracking-wider mt-5 mb-1.5 px-3"
          style={{ color: "#8A96AA", fontSize: 10, fontWeight: 500 }}
        >
          Config
        </div>
        {configNav.map((item) => {
          const active = isActive(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md mb-0.5"
              style={{
                fontSize: 13,
                color: active ? "#1B2B4B" : "#5A7099",
                background: active ? "#FFFFFF" : "transparent",
                border: active ? "1px solid #E2E6EF" : "1px solid transparent",
                borderLeft: active ? "2px solid #E5635A" : "2px solid transparent",
                paddingLeft: active ? 10 : 12,
                fontWeight: active ? 500 : 400,
              }}
            >
              <Icon size={15} strokeWidth={1.75} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 flex items-center gap-2.5" style={{ borderTop: "1px solid #E2E6EF" }}>
        <div
          className="flex items-center justify-center font-medium"
          style={{
            width: 30,
            height: 30,
            borderRadius: 999,
            background: "rgba(229,99,90,0.15)",
            color: "#E5635A",
            fontSize: 11,
          }}
        >
          SS
        </div>
        <div className="flex-1 min-w-0">
          <div style={{ color: "#1B2B4B", fontSize: 12, fontWeight: 500 }}>Shahid Saya</div>
          <div style={{ color: "#8A96AA", fontSize: 10 }}>Administrator</div>
        </div>
      </div>
    </aside>
  );
}

export function TopBar({ title, action }: { title: ReactNode; action?: ReactNode }) {
  return (
    <div
      className="flex items-center justify-between px-7 bg-white"
      style={{ height: 56, borderBottom: "1px solid var(--otto-border)" }}
    >
      <div style={{ color: "#1B2B4B", fontSize: 15, fontWeight: 500 }} className="flex items-center gap-2">{title}</div>
      <div className="flex items-center gap-2">{action}</div>
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="text-white font-medium transition-opacity hover:opacity-90"
      style={{
        background: "#1B2B4B",
        borderRadius: 8,
        padding: "7px 14px",
        fontSize: 12,
      }}
    >
      {children}
    </button>
  );
}

export function OutlineButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white transition-colors"
      style={{
        border: "1px solid #E2E6EF",
        borderRadius: 8,
        padding: "7px 14px",
        fontSize: 12,
        color: "#1B2B4B",
        fontWeight: 500,
      }}
    >
      {children}
    </button>
  );
}

export function AppLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--page-bg)" }}>
      <Sidebar />
      <div style={{ marginLeft: 240 }}>{children ?? <Outlet />}</div>
    </div>
  );
}

export function Badge({
  text,
  color,
  bg,
}: {
  text: string;
  color: string;
  bg: string;
}) {
  return (
    <span
      className="inline-flex items-center font-medium whitespace-nowrap"
      style={{
        color,
        background: bg,
        fontSize: 10.5,
        padding: "2px 8px",
        borderRadius: 999,
        lineHeight: "16px",
      }}
    >
      {text}
    </span>
  );
}

export function StatusBadge({ status }: { status: "Live" | "In review" | "Approved" | "Draft" }) {
  const map = {
    Live: { color: "#2D7D46", bg: "#EAF3DE" },
    "In review": { color: "#92580A", bg: "#FEF3E2" },
    Approved: { color: "#1A5FA5", bg: "#E6F1FB" },
    Draft: { color: "#5A7099", bg: "#F0F3F8" },
  };
  return <Badge text={status} {...map[status]} />;
}

export function AppBadge({ name }: { name: string }) {
  return <Badge text={name} color="#3C3489" bg="#EEEDFE" />;
}

export function TypeBadge({ type }: { type: "Article" | "FAQ" | "What's new" }) {
  const map = {
    Article: { color: "#92580A", bg: "#FEF3E2" },
    FAQ: { color: "#1A5FA5", bg: "#E6F1FB" },
    "What's new": { color: "#2D7D46", bg: "#EAF3DE" },
  };
  return <Badge text={type} {...map[type]} />;
}

export function Card({
  children,
  className = "",
  style = {},
  padding = 18,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  padding?: number | string;
}) {
  return (
    <div
      className={className}
      style={{
        background: "#fff",
        border: "1px solid #E2E6EF",
        borderRadius: 12,
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function PageContent({ children }: { children: ReactNode }) {
  return <div style={{ padding: 28 }}>{children}</div>;
}
