"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignRight,
} from "lucide-react";

import "./rich-text.css";

interface TextEditorProps {
  value?: string;
  onChange?: (v: string) => void;
}

export default function RichText({ value, onChange }: TextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value ?? "",
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
  });

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <ToggleGroup type="multiple" className="flex flex-wrap gap-1">
        <ToggleGroupItem
          value="bold"
          type="button"
          aria-label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </ToggleGroupItem>

        <ToggleGroupItem
          value="italic"
          type="button"
          aria-label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </ToggleGroupItem>

        <ToggleGroupItem
          value="underline"
          type="button"
          aria-label="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={16} />
        </ToggleGroupItem>

        <ToggleGroupItem
          value="bulletList"
          type="button"
          aria-label="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </ToggleGroupItem>

        <ToggleGroupItem
          value="orderedList"
          type="button"
          aria-label="Ordered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </ToggleGroupItem>

        <ToggleGroupItem
          value="alignRight"
          type="button"
          aria-label="Align Right"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
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
