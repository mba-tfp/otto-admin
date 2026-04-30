import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { TopBar, PrimaryButton, OutlineButton, PageContent, Card, Badge } from "../components/Layout";
import { TextInput, Select } from "../components/Form";
import { useStore, actions, type AppName, type TeamMember } from "../data/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Otto Help Center Admin" }] }),
  component: SettingsPage,
});

const apps: AppName[] = ["Otto Notes", "Onboarding", "Fertiwise"];

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

function MemberDialog({
  open, onOpenChange, member, onSave, onRemove,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  member: TeamMember | null; // null = invite mode
  onSave: (m: { name: string; email: string; role: "Admin" | "Editor" }) => void;
  onRemove?: () => void;
}) {
  const isInvite = !member;
  const [name, setName] = useState(member?.name ?? "");
  const [email, setEmail] = useState(member?.email ?? "");
  const [role, setRole] = useState<"Admin" | "Editor">(member?.role ?? "Editor");

  // Reset when dialog (re)opens with different member
  useState(() => {
    setName(member?.name ?? "");
    setEmail(member?.email ?? "");
    setRole(member?.role ?? "Editor");
  });

  const handleSave = () => {
    if (!email.trim()) return;
    onSave({
      name: name.trim() || email.split("@")[0],
      email: email.trim(),
      role,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isInvite ? "Invite member" : "Edit member"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {!isInvite && (
            <div>
              <div style={{ fontSize: 11, color: "#8A96AA", marginBottom: 4, fontWeight: 500 }}>NAME</div>
              <TextInput value={name} onChange={setName} width="100%" />
            </div>
          )}
          <div>
            <div style={{ fontSize: 11, color: "#8A96AA", marginBottom: 4, fontWeight: 500 }}>EMAIL</div>
            <TextInput value={email} onChange={setEmail} placeholder="name@otto.com" width="100%" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#8A96AA", marginBottom: 4, fontWeight: 500 }}>ROLE</div>
            <Select value={role} onChange={(v) => setRole(v as "Admin" | "Editor")} options={["Admin", "Editor"]} width="100%" />
          </div>
        </div>
        <DialogFooter className="flex items-center justify-between sm:justify-between">
          {!isInvite && onRemove ? (
            <button
              onClick={() => {
                if (confirm(`Remove ${member!.name} from the team?`)) {
                  onRemove();
                  onOpenChange(false);
                }
              }}
              style={{ fontSize: 12, color: "#A32D2D" }}
            >
              Remove member
            </button>
          ) : <div />}
          <div className="flex gap-2">
            <OutlineButton onClick={() => onOpenChange(false)}>Cancel</OutlineButton>
            <PrimaryButton onClick={handleSave}>{isInvite ? "Send invite" : "Save"}</PrimaryButton>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SettingsPage() {
  const [activeApp, setActiveApp] = useState<AppName>("Otto Notes");
  const branding = useStore((s) => s.branding[activeApp]);
  const team = useStore((s) => s.team);

  const [notif1, setNotif1] = useState(true);
  const [notif2, setNotif2] = useState(true);
  const [notifEmail, setNotifEmail] = useState("team@otto.com");
  const fileRef = useRef<HTMLInputElement>(null);

  const [memberDialog, setMemberDialog] = useState<{ open: boolean; member: TeamMember | null }>({
    open: false,
    member: null,
  });

  const onLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) actions.updateBranding(activeApp, { logoFileName: f.name });
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
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: branding.primaryColor, border: "1px solid #E2E6EF" }} />
                    <TextInput value={branding.primaryColor} onChange={(v) => actions.updateBranding(activeApp, { primaryColor: v })} width={80} />
                  </div>
                }
              />
              <SettingRow
                label="Sidebar background"
                sub="Help center nav colour"
                control={
                  <div className="flex items-center gap-2">
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: branding.sidebarBg, border: "1px solid #E2E6EF" }} />
                    <TextInput value={branding.sidebarBg} onChange={(v) => actions.updateBranding(activeApp, { sidebarBg: v })} width={80} />
                  </div>
                }
              />
              <SettingRow
                label="App display name"
                sub="Shown in help center header"
                control={<TextInput value={branding.displayName} onChange={(v) => actions.updateBranding(activeApp, { displayName: v })} width={150} />}
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
                    {branding.logoFileName && (
                      <>
                        <span style={{ fontSize: 11, color: "#8A96AA" }}>{branding.logoFileName}</span>
                        <button onClick={() => actions.updateBranding(activeApp, { logoFileName: null })} style={{ fontSize: 11, color: "#E5635A" }}>Remove</button>
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
                  {team.map((m, i) => (
                    <tr key={m.id} style={{ borderTop: i === 0 ? "none" : "1px solid #EEF1F7" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: "#1A1F2E" }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: "#8A96AA", marginTop: 1 }}>{m.email}</div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Badge
                          text={m.role}
                          color={m.role === "Admin" ? "#1A5FA5" : "#5A7099"}
                          bg={m.role === "Admin" ? "#E6F1FB" : "#F0F3F8"}
                        />
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <button
                          onClick={() => setMemberDialog({ open: true, member: m })}
                          style={{ fontSize: 12, color: "#1B2B4B", fontWeight: 500 }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            <div className="mt-3">
              <OutlineButton onClick={() => setMemberDialog({ open: true, member: null })}>+ Invite member</OutlineButton>
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

      {/* Re-mount on each open so internal form state resets */}
      {memberDialog.open && (
        <MemberDialog
          open={memberDialog.open}
          onOpenChange={(v) => setMemberDialog((p) => ({ ...p, open: v }))}
          member={memberDialog.member}
          onSave={(m) => {
            if (memberDialog.member) {
              actions.updateTeamMember(memberDialog.member.id, m);
            } else {
              actions.addTeamMember(m);
            }
          }}
          onRemove={memberDialog.member ? () => actions.removeTeamMember(memberDialog.member!.id) : undefined}
        />
      )}
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
