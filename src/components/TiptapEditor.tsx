import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import LinkExt from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import { useRef } from "react";
import { Bold, Italic, Underline as UIcon, Strikethrough, Heading2, Heading3, List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon, Minus } from "lucide-react";

const initialContent = `
<p>Use voice recording to capture clinical notes hands-free. This app supports real-time transcription during consultations.</p>
<h2>Getting started</h2>
<p>Follow these steps to begin recording your first session.</p>
<p><strong>Step 1:</strong> Click the Transcribe button in the session workspace to activate the microphone.</p>
<p><strong>Step 2:</strong> Allow microphone access when prompted by your browser.</p>
<p><strong>Step 3:</strong> Begin speaking — your words appear in the Transcript panel in real time.</p>
`;

function ToolbarBtn({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 26,
        height: 26,
        borderRadius: 5,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: active ? "#E2E6EF" : "transparent",
        color: active ? "#1B2B4B" : "#5A7099",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#EEF1F7"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 18, background: "#E2E6EF", margin: "0 4px" }} />;
}

export function TiptapEditor() {
  const fileRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      LinkExt.configure({ openOnClick: false, HTMLAttributes: { target: "_blank" } }),
      ImageExt.configure({ inline: false, allowBase64: true }),
    ],
    content: initialContent,
    editorProps: {
      attributes: { class: "tiptap-content" },
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      editor.chain().focus().setImage({ src }).run();
    };
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) insertImage(f);
    e.target.value = "";
  };

  return (
    <div>
      <div
        className="flex items-center flex-wrap gap-1"
        style={{ background: "#F7F9FC", border: "1px solid #EEF1F7", borderRadius: 8, padding: "6px 8px", marginBottom: 8 }}
      >
        <ToolbarBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={14} /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={14} /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UIcon size={14} /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={14} /></ToolbarBtn>
        <Divider />
        <ToolbarBtn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={14} /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={14} /></ToolbarBtn>
        <Divider />
        <ToolbarBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={14} /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={14} /></ToolbarBtn>
        <Divider />
        <ToolbarBtn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={14} /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive("link")} onClick={setLink}><LinkIcon size={14} /></ToolbarBtn>
        <ToolbarBtn onClick={() => fileRef.current?.click()}><ImageIcon size={14} /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={14} /></ToolbarBtn>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          style={{ display: "none" }}
          onChange={onFileChange}
        />
      </div>
      <div style={{
        background: "#fff",
        border: "1px solid #E2E6EF",
        borderRadius: 8,
        padding: 12,
        fontSize: 13,
        color: "#1A1F2E",
        lineHeight: 1.7,
      }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
