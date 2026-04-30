import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { TopBar, PrimaryButton, OutlineButton, PageContent, Card, Badge } from "../components/Layout";
import { TextInput } from "../components/Form";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Otto Help Center Admin" }] }),
  component: SettingsPage,
});

const apps = ["Otto Notes", "Onboarding", "Fertiwise"];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="uppercase tracking-wider" style={{ color: "#8A96AA", fontSize: 10, fontWeight: 600, marginBottom: 10 }}>
      {children}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 34,
        height: 20,
        borderRadius: 999,
        background: on ? "#1B2B4B" : "#E2E6EF",
        position: "relative",
        transition: "background 0.15s",
      }}
    >
      <div style={{
        position: "absolute",
        top: 2,
        left: on ? 16 : 2,
        width: 16,
        height: 16,
        borderRadius: 999,
        background: "#fff",
        transition: "left 0.15s",
      }} />
    </button>
  );
}

function SettingsPage() {
  const [activeApp, setActiveApp] = useState("Otto Notes");
  const [primaryColor, setPrimaryColor] = useState("#E5635A");
  const [sidebarBg, setSidebarBg] = useState("#EEF1F7");
  const [appName, setAppName] = useState("Otto Notes");
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [notif1, setNotif1] = useState(true);
  const [notif2, setNotif2] = useState(true);
  const [notifEmail, setNotifEmail] = useState("team@otto.com");
  const fileRef = useRef<HTMLInputElement>(null);

  const onLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setLogoFile(f.name);
  };

  return (
    <>
      <TopBar title="Settings" action={<PrimaryButton>Save changes</PrimaryButton>} />
      <PageContent>
        <div className="grid grid-cols-2 gap-4">
          {/* LEFT */}
          <div>
            <SectionLabel>App branding</SectionLabel>
            <div className="flex gap-1.5 mb-4">
              {apps.map((a) => {
                const active = a === activeApp;
                return (
                  <button
                    key={a}
                    onClick={() => setActiveApp(a)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 500,
                      background: active ? "#1B2B4B" : "#F0F3F8",
                      color: active ? "#fff" : "#5A7099",
                      border: "none",
                    }}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
            <Card padding="0 16px">
              <SettingRow
                label="Primary colour"
                sub="CTAs, active states"
                control={
                  <div className="flex items-center gap-2">
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: primaryColor, border: "1px solid #E2E6EF" }} />
                    <TextInput value={primaryColor} onChange={setPrimaryColor} width={80} />
                  </div>
                }
              />
              <SettingRow
                label="Sidebar background"
                sub="Help center nav colour"
                control={
                  <div className="flex items-center gap-2">
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: sidebarBg, border: "1px solid #E2E6EF" }} />
                    <TextInput value={sidebarBg} onChange={setSidebarBg} width={80} />
                  </div>
                }
              />
              <SettingRow
                label="App display name"
                sub="Shown in help center header"
                control={<TextInput value={appName} onChange={setAppName} width={150} />}
              />
              <SettingRow
                label="Logo"
                sub="SVG or PNG, max 200×40px"
                isLast
                control={
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/svg+xml,image/png"
                      style={{ display: "none" }}
                      onChange={onLogoUpload}
                    />
                    <OutlineButton onClick={() => fileRef.current?.click()}>Upload logo</OutlineButton>
                    {logoFile && (
                      <>
                        <span style={{ fontSize: 11, color: "#8A96AA" }}>{logoFile}</span>
                        <button onClick={() => setLogoFile(null)} style={{ fontSize: 11, color: "#E5635A" }}>Remove</button>
                      </>
                    )}
                  </div>
                }
              />
            </Card>

            <div style={{ marginTop: 24 }}>
              <SectionLabel>API keys</SectionLabel>
              <Card padding="0 16px">
                {apps.map((a, i) => (
                  <SettingRow
                    key={a}
                    label={a}
                    sub="Frontend content API key"
                    isLast={i === apps.length - 1}
                    control={<OutlineButton>Reveal</OutlineButton>}
                  />
                ))}
              </Card>
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <SectionLabel>Team members</SectionLabel>
            <Card padding={0}>
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <tbody>
                  {[
                    { name: "Shahid Saya", email: "shahid@otto.com", role: "Admin", color: "#1A5FA5", bg: "#E6F1FB" },
                    { name: "A. Malik", email: "a.malik@otto.com", role: "Editor", color: "#5A7099", bg: "#F0F3F8" },
                    { name: "R. Khan", email: "r.khan@otto.com", role: "Editor", color: "#5A7099", bg: "#F0F3F8" },
                  ].map((m, i) => (
                    <tr key={m.email} style={{ borderTop: i === 0 ? "none" : "1px solid #EEF1F7" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: "#1A1F2E" }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: "#8A96AA", marginTop: 1 }}>{m.email}</div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Badge text={m.role} color={m.color} bg={m.bg} />
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <button style={{ fontSize: 12, color: "#1B2B4B", fontWeight: 500 }}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            <div className="mt-3">
              <OutlineButton>+ Invite member</OutlineButton>
            </div>

            <div style={{ marginTop: 24 }}>
              <SectionLabel>Notifications</SectionLabel>
              <Card padding="0 16px">
                <SettingRow
                  label="New feedback submissions"
                  sub="Email on new submission"
                  control={<Toggle on={notif1} onChange={setNotif1} />}
                />
                <SettingRow
                  label="Content submitted for review"
                  sub="Email when editor submits"
                  control={<Toggle on={notif2} onChange={setNotif2} />}
                />
                <SettingRow
                  label="Notification email"
                  isLast
                  control={<TextInput value={notifEmail} onChange={setNotifEmail} width={160} />}
                />
              </Card>
            </div>
          </div>
        </div>
      </PageContent>
    </>
  );
}

function SettingRow({ label, sub, control, isLast }: { label: string; sub?: string; control: React.ReactNode; isLast?: boolean }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ padding: "12px 0", borderBottom: isLast ? "none" : "1px solid #EEF1F7" }}
    >
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#1A1F2E" }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "#8A96AA", marginTop: 1 }}>{sub}</div>}
      </div>
      {control}
    </div>
  );
}
