'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback, useEffect } from 'react';

type Props = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  showToolbar?: boolean;
};

export default function RichTextEditor({
  content,
  onChange,
  placeholder = '내용을 입력하세요...',
  className = '',
  minHeight = 'min-h-[160px]',
  showToolbar = true,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        bulletList: true,
        orderedList: true,
        listItem: true,
        horizontalRule: false,
        hardBreak: true,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `ProseMirror focus:outline-none ${minHeight} px-4 py-3 text-stone-700 leading-relaxed`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  const setBold = useCallback(() => editor?.chain().focus().toggleBold().run(), [editor]);
  const setItalic = useCallback(() => editor?.chain().focus().toggleItalic().run(), [editor]);

  if (!editor) return null;

  return (
    <div
      className={`rounded-xl border border-stone-200 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400 transition-colors ${className}`}
    >
      {showToolbar && (
        <div className="flex items-center gap-1 px-3 py-2 border-b border-stone-200 bg-stone-50 rounded-t-xl">
          <button
            type="button"
            onClick={setBold}
            onMouseDown={(e) => e.preventDefault()}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              editor.isActive('bold') ? 'bg-amber-500 text-white' : 'text-stone-600 hover:bg-stone-200'
            }`}
            title="굵게 (Ctrl+B)"
          >
            B
          </button>
          <button
            type="button"
            onClick={setItalic}
            onMouseDown={(e) => e.preventDefault()}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              editor.isActive('italic') ? 'bg-amber-500 text-white' : 'text-stone-600 hover:bg-stone-200'
            }`}
            title="기울임 (Ctrl+I)"
          >
            I
          </button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
