"use client";

import { useMemo } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

type Category = {
  id: string;
  name: string;
  parentId?: string | null;
  children?: Category[];
};

type ParentCategorySelectProps = {
  control: any;
  name: string;
  categories: Category[];
};

function buildTree(categories: Category[], parentId: string | null = null): Category[] {
  return categories
    .filter((cat) => cat.parentId === parentId)
    .map((cat) => ({
      ...cat,
      children: buildTree(categories, cat.id),
    }));
}

function renderOptions(categories: Category[], level = 0): React.ReactNode[] {
  return categories.flatMap((cat) => {
    const indent = level * 12;
    const option = (
      <SelectItem
        key={cat.id}
        value={cat.id}
        style={{ paddingRight: indent + 12 ,textAlign:"right",direction:"rtl"}}
      >
        {cat.name}
      </SelectItem>
    );

    if (cat.children && cat.children.length > 0) {
      return [option, ...renderOptions(cat.children, level + 1)];
    }

    return [option];
  });
}

export function ParentCategorySelect({ control, name, categories }: ParentCategorySelectProps) {
  const tree = useMemo(() => buildTree(categories), [categories]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>دسته‌بندی مادر (اختیاری)</FormLabel>
          <Select
            onValueChange={(value) => field.onChange(value === "none" ? null : value)}
            value={field.value ?? "none"}
          >
            <FormControl>
              <SelectTrigger dir="rtl"  className="w-full border-b-2  border-green-600 bg-transparent text-rigth text-sm py-2 focus:outline-none focus:border-green-700">
                <SelectValue className="text-right"  placeholder="انتخاب دسته‌بندی مادر" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem dir="rtl" value="none">بدون دسته‌بندی مادر</SelectItem>
              {renderOptions(tree)}
            </SelectContent>
          </Select>
          <input type="hidden" name="parentId" value={field.value ?? ""} />
        </FormItem>
      )}
    />
  );
}
