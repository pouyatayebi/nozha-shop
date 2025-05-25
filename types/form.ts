export type FormState = {
  /** موفقیت یا شکست اکشن */
  success: boolean;

  /**
   * عدد یکتا (مثلاً Date.now()) که در هر موفقیت تازه می‌شود.
   * باعث می‌شود useEffect با تغییر آن دوباره اجرا شود.
   */
  version?: number;

  /** فیلدهای فرم برای ری‌پاپیوله کردن در خطاها */
  fields?: Record<string, string>;

  /** پیام‌های خطا؛ key = نام فیلد، value = آرایهٔ پیام‌ها */
  errors?: Record<string, string[]>;
};