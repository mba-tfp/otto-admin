import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export function Select({
  value,
  onChange,
  options,
  width,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  width?: number | string;
}) {
  return (
    <div className="relative inline-block" style={{ width }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white w-full"
        style={{
          border: "1px solid #E2E6EF",
          borderRadius: 8,
          padding: "7px 28px 7px 10px",
          fontSize: 12,
          color: "#1A1F2E",
          cursor: "pointer",
        }}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown
        size={14}
        style={{
          position: "absolute",
          right: 8,
          top: "50%",
          transform: "translateY(-50%)",
          color: "#8A96AA",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  width,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  width?: number | string;
  style?: React.CSSProperties;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width,
        border: "1px solid #E2E6EF",
        borderRadius: 8,
        padding: "7px 10px",
        fontSize: 12,
        color: "#1A1F2E",
        background: "#fff",
        outline: "none",
        ...style,
      }}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <div
      className="uppercase tracking-wider"
      style={{ color: "#8A96AA", fontSize: 11, fontWeight: 500, marginBottom: 6 }}
    >
      {children}
    </div>
  );
}
