// components/forms/parent-category-select.tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/store/category.store";
import { ChevronLeft } from "lucide-react";

/**
 * یک تابع ساده برای ساختار درختی از آرایهٔ تخت دسته‌ها.
 * خروجی: ریشه‌ها و مپ فرزندها.
 */
function buildTree(flat: Category[]) {
  const roots: Category[] = [];
  const children: Record<string, Category[]> = {};

  flat.forEach((c) => {
    if (c.parentId) {
      (children[c.parentId] ||= []).push(c);
    } else {
      roots.push(c);
    }
  });

  return { roots, children };
}

interface ParentSelectProps {
  /** همهٔ دسته‌ها */
  categories: Category[];
  /** مقدار فعلی که می‌تواند string یا null یا undefined باشد */
  value?: string | null;
  /** تابع فراخوانی هنگام انتخاب (یا خالی‌شدن) */
  onChange: (id: string | undefined) => void;
  /** در حالت ویرایش، برای جلوگیری از انتخاب خودش */
  excludeId?: string;
}

export default function ParentCategorySelect({
  categories,
  value,
  onChange,
  excludeId,
}: ParentSelectProps) {
  // ابتدا آیتم جاری را از لیست حذف می‌کنیم
  const filtered = categories.filter((c) => c.id !== excludeId);
  const { roots, children } = buildTree(filtered);

  return (
    <Select
      value={value ?? "none"}
      onValueChange={(v) => onChange(v === "none" ? undefined : v)}
    >
      <SelectTrigger>
        <SelectValue placeholder="بدون دسته" />
      </SelectTrigger>

      <SelectContent className="rtl"> {/* برای اطمینان از راست‌چین */}
        <SelectItem value="none" className="text-right">
          بدون دسته
        </SelectItem>

        {/* ابتدا ریشه‌ها را نشان می‌دهیم */}
        {roots.map((root) => (
          <CategoryOption
            key={root.id}
            item={root}
            depth={0}
            selected={value === root.id}
          >
            {/* سپس فرزندان آن ریشه را (در صورت وجود) */}
            {children[root.id]?.map((child) => (
              <CategoryOption
                key={child.id}
                item={child}
                depth={1}
                selected={value === child.id}
              />
            ))}
          </CategoryOption>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * یک آیتم درون لیست Select
 * - depth = 0 برای ریشه‌ها (بولد و بزرگ‌تر)
 * - depth = 1 برای فرزندها (کوچک‌تر و با تورفتگی از راست)
 */
function CategoryOption({
  item,
  depth,
  selected,
  children,
}: {
  item: Category;
  depth: number;
  selected: boolean;
  children?: React.ReactNode;
}) {
  // در راست‌چین به جای padding-left از padding-right استفاده می‌کنیم
  const indent = depth === 0 ? "" : "pr-6";
  const font   = depth === 0 ? "font-bold text-sm" : "text-[13px]";
  // برای ریشه‌ها آیکون ChevronLeft اضافه می‌کنیم
  const icon   =
    depth === 0 && children ? (
      <ChevronLeft size={12} className="opacity-60" />
    ) : null;

  return (
    <>
      <SelectItem
        value={item.id}
        className={`${indent} ${font} flex flex-row-reverse items-center gap-1 text-right`}
      >
        {icon}
        {item.title}
      </SelectItem>
      {children}
    </>
  );
}
// این تابع برای ساختار درختی دسته‌ها استفاده می‌شود