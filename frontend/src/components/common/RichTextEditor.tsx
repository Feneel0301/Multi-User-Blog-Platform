"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[300px] p-6 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5 backdrop-blur-md shadow-inner">
      {/* Cinematic Custom Toolbar */}
      <div className="flex gap-2 p-3 border-b border-white/10 bg-[#0A1F44]/50 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-white text-[#0A1F44]' : 'bg-transparent text-slate-300 border-white/20 hover:bg-white/10'}
        >
          Bold
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-white text-[#0A1F44]' : 'bg-transparent text-slate-300 border-white/20 hover:bg-white/10'}
        >
          Italic
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-white text-[#0A1F44]' : 'bg-transparent text-slate-300 border-white/20 hover:bg-white/10'}
        >
          H2
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-white text-[#0A1F44]' : 'bg-transparent text-slate-300 border-white/20 hover:bg-white/10'}
        >
          H3
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-white text-[#0A1F44]' : 'bg-transparent text-slate-300 border-white/20 hover:bg-white/10'}
        >
          Bullet List
        </Button>
      </div>
      
      {/* The actual text writing area */}
      <div className="text-slate-100">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}