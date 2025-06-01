/**
 * تبدیل نام فارسی/انگلیسی به اسلاگ URL-friendly
 * مثال:  "کیف دوشی چرمی" → "کیف-دوشی-چرمی"
 */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[\s\W-]+/g, "-") // فاصله و کاراکترهای غیرکلمه به -
    .replace(/^-+|-+$/g, "");  // حذف - های ابتدا و انتها
}
