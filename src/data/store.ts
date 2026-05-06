import { useSyncExternalStore } from "react";

// ----- Types -----
export type AppName = "Otto Notes" | "Onboarding" | "Fertiwise";
export type ContentType = "Article" | "FAQ" | "What's new";
export type Status = "Draft" | "In review" | "Approved" | "Live";

export type Article = {
  id: string;
  title: string;
  type: ContentType;
  apps: string[]; // can include "All apps"
  status: Status;
  date: string;
  author: string;
  body: string;
};

export type FeedbackType = "Bug report" | "Support" | "Feedback" | "Rating";
export type FeedbackStatus = "New" | "In progress" | "Resolved";

export type FeedbackItem = {
  id: string;
  type: FeedbackType;
  app: AppName;
  subject: string;
  sender: string;
  email: string;
  time: string;
  message: string;
  unread: boolean;
  status: FeedbackStatus;
  note: string;
};

export type Branding = {
  displayName: string;
  slug: string;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Editor";
};

type State = {
  articles: Article[];
  feedback: FeedbackItem[];
  branding: Record<AppName, Branding>;
  team: TeamMember[];
};

// ----- Initial data -----
const initialArticles: Article[] = [
  { id: "a1", title: "Create Your First Session", type: "Article", apps: ["Otto Notes"], status: "Live", date: "Apr 28", author: "Shahid S.", body: "<p>Welcome — this guide walks you through creating your first session in Otto Notes.</p>" },
  { id: "a2", title: "Using Templates", type: "Article", apps: ["Otto Notes"], status: "Live", date: "Apr 27", author: "Shahid S.", body: "<p>Templates speed up note creation by pre-populating common section structures.</p>" },
  { id: "a3", title: "Dictation & Recording", type: "Article", apps: ["Otto Notes", "Onboarding"], status: "In review", date: "Apr 26", author: "A. Malik", body: `<p>Use voice recording to capture clinical notes hands-free. This app supports real-time transcription during consultations.</p><h2>Getting started</h2><p>Follow these steps to begin recording your first session.</p><p><strong>Step 1:</strong> Click the Transcribe button in the session workspace to activate the microphone.</p><p><strong>Step 2:</strong> Allow microphone access when prompted by your browser.</p><p><strong>Step 3:</strong> Begin speaking — your words appear in the Transcript panel in real time.</p>` },
  { id: "a4", title: "Managing Letters", type: "Article", apps: ["Otto Notes"], status: "In review", date: "Apr 25", author: "A. Malik", body: "<p>Generate, edit, and send GP letters directly from a completed session.</p>" },
  { id: "a5", title: "Templates & Notes FAQ", type: "FAQ", apps: ["Otto Notes"], status: "Live", date: "Apr 22", author: "R. Khan", body: "<p>Common questions about templates and note formatting.</p>" },
  { id: "a6", title: "Account & Billing FAQ", type: "FAQ", apps: ["Otto Notes", "Fertiwise"], status: "In review", date: "Apr 21", author: "R. Khan", body: "<p>Questions about subscriptions, invoices, and payment methods.</p>" },
  { id: "a7", title: "AI Writing Assistant v2", type: "What's new", apps: ["Otto Notes"], status: "Approved", date: "Apr 19", author: "Shahid S.", body: "<p>The AI writing assistant has been upgraded with faster suggestions and better clinical terminology.</p>" },
  { id: "a8", title: "Privacy & Security FAQ", type: "FAQ", apps: ["All apps"], status: "Draft", date: "Apr 18", author: "R. Khan", body: "<p>How Otto handles patient data, encryption, and access controls.</p>" },
];

const initialFeedback: FeedbackItem[] = [
  { id: "f1", type: "Bug report", app: "Otto Notes", subject: "Transcript stops mid-session", sender: "Dr. Amara Patel", email: "amara@clinic.com", time: "1 hour ago", message: "When I record a session longer than about 8 minutes, the transcript stops updating but the recording timer keeps running. I have to stop and restart, losing the audio between.", unread: true, status: "New", note: "" },
  { id: "f2", type: "Support", app: "Onboarding", subject: "Can't find patient import option", sender: "Clinic Admin", email: "admin@example.com", time: "3 hours ago", message: "I'm trying to bulk-import our patient list from a CSV but the import button is not visible in the workflow setup screen. Where is it?", unread: true, status: "New", note: "" },
  { id: "f3", type: "Bug report", app: "Otto Notes", subject: "Letter not generating from session", sender: "Dr. Ben Harlow", email: "ben@harlow.uk", time: "Yesterday", message: "After completing a session and clicking 'Generate letter', nothing happens. No error, no letter. Tried in Chrome and Safari.", unread: true, status: "New", note: "" },
  { id: "f4", type: "Feedback", app: "Otto Notes", subject: "Love the new template editor UI", sender: "Anonymous", email: "—", time: "2 days ago", message: "The redesign is gorgeous. Much faster to build a template now. One ask: please add keyboard shortcut for inserting a section.", unread: false, status: "Resolved", note: "" },
  { id: "f5", type: "Rating", app: "Fertiwise", subject: "★★★★☆ — Good but slow to load", sender: "Anonymous", email: "—", time: "3 days ago", message: "App is great once it loads, but initial load on cellular is painfully slow. Could you add an offline mode for cycle tracking?", unread: false, status: "In progress", note: "" },
];

const initialBranding: Record<AppName, Branding> = {
  "Otto Notes": { displayName: "Otto Notes", slug: "otto-notes" },
  "Onboarding": { displayName: "Otto Onboarding", slug: "onboarding" },
  "Fertiwise": { displayName: "Fertiwise", slug: "fertiwise" },
};

const initialTeam: TeamMember[] = [
  { id: "t1", name: "Shahid Saya", email: "shahid@otto.com", role: "Admin" },
  { id: "t2", name: "A. Malik", email: "a.malik@otto.com", role: "Editor" },
  { id: "t3", name: "R. Khan", email: "r.khan@otto.com", role: "Editor" },
];

// ----- Store implementation -----
let state: State = {
  articles: initialArticles,
  feedback: initialFeedback,
  branding: initialBranding,
  team: initialTeam,
};

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const getSnapshot = () => state;
const setState = (updater: (s: State) => State) => {
  state = updater(state);
  listeners.forEach((l) => l());
};

// ----- Hooks -----
export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

// ----- Actions -----
export const actions = {
  upsertArticle(a: Article) {
    setState((s) => {
      const idx = s.articles.findIndex((x) => x.id === a.id);
      if (idx === -1) return { ...s, articles: [a, ...s.articles] };
      const next = [...s.articles];
      next[idx] = a;
      return { ...s, articles: next };
    });
  },
  setArticleStatus(id: string, status: Status) {
    setState((s) => ({
      ...s,
      articles: s.articles.map((a) => (a.id === id ? { ...a, status } : a)),
    }));
  },
  deleteArticle(id: string) {
    setState((s) => ({ ...s, articles: s.articles.filter((a) => a.id !== id) }));
  },
  markAllFeedbackRead() {
    setState((s) => ({ ...s, feedback: s.feedback.map((f) => ({ ...f, unread: false })) }));
  },
  newArticleId() {
    return "a" + Math.random().toString(36).slice(2, 9);
  },
  updateFeedback(id: string, patch: Partial<FeedbackItem>) {
    setState((s) => ({
      ...s,
      feedback: s.feedback.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }));
  },
  markFeedbackRead(id: string) {
    setState((s) => ({
      ...s,
      feedback: s.feedback.map((f) => (f.id === id ? { ...f, unread: false } : f)),
    }));
  },
  updateBranding(app: AppName, patch: Partial<Branding>) {
    setState((s) => ({
      ...s,
      branding: { ...s.branding, [app]: { ...s.branding[app], ...patch } },
    }));
  },
  addTeamMember(m: Omit<TeamMember, "id">) {
    setState((s) => ({ ...s, team: [...s.team, { ...m, id: "t" + Math.random().toString(36).slice(2, 9) }] }));
  },
  updateTeamMember(id: string, patch: Partial<TeamMember>) {
    setState((s) => ({ ...s, team: s.team.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  },
  removeTeamMember(id: string) {
    setState((s) => ({ ...s, team: s.team.filter((t) => t.id !== id) }));
  },
};
