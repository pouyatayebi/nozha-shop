import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";

export function FormInputShadcn({ className, ...props }:  React.ComponentProps<"input">) {
  return (
    <Input
      {...props}
      className={cn(
        // فقط خط زیر سبز، بقیه حذف
        "border-0 border-b-2 border-primary rounded-none bg-transparent",
        // متن و placeholder وسط‌چین و سبزرنگ
        " placeholder:text-gray-500 text-sm",
        // حذف focus ring و outline اضافی
        "focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none visited:outline-none",
        className
      )}
    />
  );
}