"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocation } from "@/context/LocationContext";

const links = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Sky Feed", href: "/sky-feed" },
  { label: "Night Planner", href: "/planner" },
  { label: "AI Chat", href: "/assistant" },
  { label: "Sky Chart", href: "/locator" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { location, loading, error } = useLocation();

  if (pathname === "/") return null;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        height: "62px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 48px",
        }}
      >
        {/* Brand */}
{/* Brand + Location */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "14px",
  }}
>
  <Link
    href="/"
    style={{
      textDecoration: "none",
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: "15px",
      letterSpacing: "0.12em",
      color: "#E8EAF6",
    }}
  >
    SPACE
    <span style={{ color: "#00E5FF" }}>PULSE</span>
    <span
      style={{
        marginLeft: "6px",
        fontSize: "10px",
        letterSpacing: "0.15em",
        color: "rgba(0,229,255,0.5)",
      }}
    >
      AI
    </span>
  </Link>

  <div
    style={{
      width: "1px",
      height: "16px",
      background: "rgba(255,255,255,0.08)",
    }}
  />

  <span
    style={{
      color: "rgba(255,255,255,0.55)",
      fontSize: "11px",
      letterSpacing: "0.08em",
      fontFamily: "var(--font-display)",
    }}
  >
    📍{" "}
    {loading
      ? "Detecting..."
      : error
      ? "Location Off"
      : location?.city || "Unknown"}
  </span>

<span
  style={{
    color: "#4ADE80",
    animation: "pulse 2s infinite",
    fontFamily: "var(--font-display)",
    fontSize: "10px",
  }}
>
  ● CURRENT LOCATION
</span>
</div>

        {/* Navigation + Status */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "28px",
  }}
>
  {/* Links */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "34px",
    }}
  >
    {links.map((link) => {
      const active = pathname === link.href;

      return (
        <Link
          key={link.href}
          href={link.href}
          style={{
            textDecoration: "none",
            textTransform: "uppercase",
            fontSize: "12px",
            letterSpacing: "0.12em",
            fontFamily: "var(--font-display)",
            color: active
              ? "#00E5FF"
              : "rgba(255,255,255,0.45)",
            transition: "all 0.2s ease",
          }}
        >
          {link.label}
        </Link>
      );
    })}
  </div>

  </div>
  </div>
  </nav>
  );
}