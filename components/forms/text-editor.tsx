
"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  ListOrdered,
  List,
  AlignRight,
} from "lucide-react";
import "./rich-text.css";

export function TextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <ToggleGroup type="multiple" className="flex gap-1 flex-wrap">
        <ToggleGroupItem
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          data-state={editor.isActive("bold") ? "on" : "off"}
        >
          <Bold size={16} />
        </ToggleGroupItem>
        <ToggleGroupItem
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          data-state={editor.isActive("italic") ? "on" : "off"}
        >
          <Italic size={16} />
        </ToggleGroupItem>
        <ToggleGroupItem
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          data-state={editor.isActive("underline") ? "on" : "off"}
        >
          <UnderlineIcon size={16} />
        </ToggleGroupItem>
        <ToggleGroupItem
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          data-state={editor.isActive("bulletList") ? "on" : "off"}
        >
          <List size={16} />
        </ToggleGroupItem>
        <ToggleGroupItem
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          data-state={editor.isActive("orderedList") ? "on" : "off"}
        >
          <ListOrdered size={16} />
        </ToggleGroupItem>
        <ToggleGroupItem
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          data-state={editor.isActive({ textAlign: "right" }) ? "on" : "off"}
        >
          <AlignRight size={16} />
        </ToggleGroupItem>
      </ToggleGroup>
      <div className="border rounded-md p-2 min-h-[150px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
