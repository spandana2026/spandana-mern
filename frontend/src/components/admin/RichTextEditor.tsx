import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useCallback } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Link2, Unlink, RemoveFormatting, Heading1, Heading2, Heading3,
  Quote,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  label?: string;
}

const colorInputValue = (value: unknown, fallback: string) =>
  typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;

function ToolBtn({
  active, onClick, title, children, danger,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all text-sm
        ${active
          ? "bg-primary text-white shadow-sm"
          : danger
            ? "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-5 bg-border mx-0.5 shrink-0" />;
}

export default function RichTextEditor({
  value, onChange, placeholder = "Write something…", minHeight = 180, label,
}: RichTextEditorProps) {
  const onChangeSafe = useCallback(onChange, []);
  const initialised = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChangeSafe(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none px-3 py-2.5 text-foreground",
        style: `min-height:${minHeight}px`,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (!initialised.current) {
      initialised.current = true;
      return;
    }
    if (value !== editor.getHTML() && value !== undefined) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  function addLink() {
    const url = window.prompt("Enter URL:", editor?.getAttributes("link").href ?? "https://");
    if (url === null) return;
    if (url === "") { editor?.chain().focus().unsetLink().run(); return; }
    editor?.chain().focus().setLink({ href: url }).run();
  }

  if (!editor) return null;

  const h = editor.getAttributes("heading").level;

  return (
    <div className="rounded-xl border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/30">
      {label && (
        <div className="px-3 pt-2 pb-0">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/40">
        {/* Heading */}
        <ToolBtn active={h === 1} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">
          <Heading1 size={14} />
        </ToolBtn>
        <ToolBtn active={h === 2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
          <Heading2 size={14} />
        </ToolBtn>
        <ToolBtn active={h === 3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">
          <Heading3 size={14} />
        </ToolBtn>

        <Sep />

        {/* Inline styles */}
        <ToolBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
          <Bold size={13} />
        </ToolBtn>
        <ToolBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
          <Italic size={13} />
        </ToolBtn>
        <ToolBtn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
          <UnderlineIcon size={13} />
        </ToolBtn>
        <ToolBtn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
          <Strikethrough size={13} />
        </ToolBtn>

        <Sep />

        {/* Alignment */}
        <ToolBtn active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Align left">
          <AlignLeft size={13} />
        </ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Align center">
          <AlignCenter size={13} />
        </ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Align right">
          <AlignRight size={13} />
        </ToolBtn>

        <Sep />

        {/* Lists */}
        <ToolBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
          <List size={13} />
        </ToolBtn>
        <ToolBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
          <ListOrdered size={13} />
        </ToolBtn>
        <ToolBtn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote">
          <Quote size={13} />
        </ToolBtn>

        <Sep />

        {/* Link */}
        <ToolBtn active={editor.isActive("link")} onClick={addLink} title="Insert / Edit link">
          <Link2 size={13} />
        </ToolBtn>
        {editor.isActive("link") && (
          <ToolBtn onClick={() => editor.chain().focus().unsetLink().run()} title="Remove link" danger>
            <Unlink size={13} />
          </ToolBtn>
        )}

        <Sep />

        {/* Text colour */}
        <label
          title="Text colour"
          className="relative w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-all cursor-pointer"
        >
          <span className="text-xs font-bold leading-none" style={{ color: editor.getAttributes("textStyle").color ?? "inherit" }}>A</span>
          <span
            className="absolute bottom-1 left-1.5 right-1.5 h-0.5 rounded-full"
            style={{ backgroundColor: editor.getAttributes("textStyle").color ?? "hsl(var(--primary))" }}
          />
          <input
            type="color"
            className="sr-only"
            value={colorInputValue(editor.getAttributes("textStyle").color, "#0033A0")}
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          />
        </label>

        <Sep />

        {/* Clear */}
        <ToolBtn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting" danger>
          <RemoveFormatting size={13} />
        </ToolBtn>
      </div>

      {/* ── Editor area ── */}
      <style>{`
        .rte-content .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
          font-size: 0.875rem;
        }
        .rte-content .ProseMirror h1 { font-size:1.5rem; font-weight:700; margin:0.75rem 0 0.25rem; }
        .rte-content .ProseMirror h2 { font-size:1.25rem; font-weight:700; margin:0.65rem 0 0.2rem; }
        .rte-content .ProseMirror h3 { font-size:1.05rem; font-weight:600; margin:0.5rem 0 0.15rem; }
        .rte-content .ProseMirror ul { list-style-type:disc; padding-left:1.4rem; margin:0.4rem 0; }
        .rte-content .ProseMirror ol { list-style-type:decimal; padding-left:1.4rem; margin:0.4rem 0; }
        .rte-content .ProseMirror li { margin:0.15rem 0; }
        .rte-content .ProseMirror blockquote { border-left:3px solid hsl(var(--primary)); padding-left:0.75rem; margin:0.5rem 0; color:hsl(var(--muted-foreground)); }
        .rte-content .ProseMirror a { color:hsl(var(--primary)); text-decoration:underline; }
        .rte-content .ProseMirror strong { font-weight:700; }
        .rte-content .ProseMirror em { font-style:italic; }
        .rte-content .ProseMirror p { margin:0.2rem 0; line-height:1.65; }
        .rte-content .ProseMirror:focus { outline:none; }
      `}</style>
      <div className="rte-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
