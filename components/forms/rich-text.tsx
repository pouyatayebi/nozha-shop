// "use client";

// import { useEffect, useState } from "react";
// import { EditorContent, useEditor } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import Underline from "@tiptap/extension-underline";
// import TextAlign from "@tiptap/extension-text-align";

// import {
//   ToggleGroup,
//   ToggleGroupItem,
// } from "@/components/ui/toggle-group";

// import {
//   Bold,
//   Italic,
//   Underline as UnderlineIcon,
//   ListOrdered,
//   List,
//   AlignRight,
// } from "lucide-react";

// import "./rich-text.css";

// export function RichText({
//   value,
//   onChange,
// }: {
//   value?: string;
//   onChange: (value: string) => void;
// }) {
//   const editor = useEditor({
//     extensions: [
//       StarterKit.configure({
//         bulletList: { keepMarks: true },
//         orderedList: { keepMarks: true },
//       }),
//       Underline,
//       TextAlign.configure({ types: ["heading", "paragraph"] }),
//     ],
//     content: value,
//     onUpdate: ({ editor }) => {
//       const html = editor.getHTML();
//       onChange(html);
//     },
//   });

//   useEffect(() => {
//     if (editor && value !== editor.getHTML()) {
//       editor.commands.setContent(value);
//     }
//   }, [value, editor]);

//   if (!editor) return null;

//   const handleToggle = (action: () => void) => {
//     editor.chain().focus();
//     action();
//   };

//   return (
//     <div className="space-y-2">
//       <ToggleGroup type="multiple" className="flex gap-1 flex-wrap" value={[]}>
//         <ToggleGroupItem
//           value="bold"
//           onClick={() => handleToggle(() => editor.chain().toggleBold().run())}
//         >
//           <Bold size={16} />
//         </ToggleGroupItem>

//         <ToggleGroupItem
//           value="italic"
//           onClick={() => handleToggle(() => editor.chain().toggleItalic().run())}
//         >
//           <Italic size={16} />
//         </ToggleGroupItem>

//         <ToggleGroupItem
//           value="underline"
//           onClick={() => handleToggle(() => editor.chain().toggleUnderline().run())}
//         >
//           <UnderlineIcon size={16} />
//         </ToggleGroupItem>

//         <ToggleGroupItem
//           value="bullet"
//           onClick={() => handleToggle(() => editor.chain().toggleBulletList().run())}
//         >
//           <List size={16} />
//         </ToggleGroupItem>

//         <ToggleGroupItem
//           value="ordered"
//           onClick={() => handleToggle(() => editor.chain().toggleOrderedList().run())}
//         >
//           <ListOrdered size={16} />
//         </ToggleGroupItem>

//         <ToggleGroupItem
//           value="alignRight"
//           onClick={() => handleToggle(() => editor.chain().setTextAlign("right").run())}
//         >
//           <AlignRight size={16} />
//         </ToggleGroupItem>
//       </ToggleGroup>

//       <div className="border rounded-md p-2 min-h-[150px] bg-white">
//         <EditorContent editor={editor} />
//       </div>
//     </div>
//   );
// }


// components/forms/rich-text.tsx  (نسخهٔ نهایی)

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

interface RichTextProps {
  value?: string;
  onChange?: (v: string) => void;
}

export function RichText({ value, onChange }: RichTextProps) {
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
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          <Bold size={16} />
        </ToggleGroupItem>

        <ToggleGroupItem
          value="italic"
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <Italic size={16} />
        </ToggleGroupItem>

        <ToggleGroupItem
          value="underline"
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          aria-label="Underline"
        >
          <UnderlineIcon size={16} />
        </ToggleGroupItem>

        <ToggleGroupItem
          value="bulletList"
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Bullet List"
        >
          <List size={16} />
        </ToggleGroupItem>

        <ToggleGroupItem
          value="orderedList"
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Ordered List"
        >
          <ListOrdered size={16} />
        </ToggleGroupItem>

        <ToggleGroupItem
          value="alignRight"
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          aria-label="Align Right"
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

