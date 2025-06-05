// store/user.store.ts
import { create } from "zustand";

/** نوع دادهٔ کاربر (مطابق با مدل Prisma ولی ساده‌شده) */
export type User = {
  id: string;
  phone: string;
  role: "USER" | "ADMIN";
  avatarId?: string | null;
  // برای آینده می‌توانید فیلدهای بیشتری مثل createdAt و updatedAt اضافه کنید
};

/** وضعیت درون استور برای کاربر */
type UserStore = {
  /** کاربر فعلی (null اگر لاگین نکرده باشد) */
  currentUser: User | null;

  /** تنظیم کاربر فعلی */
  setCurrentUser: (user: User | null) => void;

  /** واکشی اطلاعات کاربر از سرور (مثلاً با فراخوانی /api/auth/session) */
  fetchCurrentUser: () => Promise<void>;
};

export const useUserStore = create<UserStore>((set) => ({
  currentUser: null,

  setCurrentUser: (user) => set({ currentUser: user }),

  fetchCurrentUser: async () => {
    try {
      // فرض کنید یک API در مسیر /api/auth/session داریم که اطلاعات session را برمی‌گرداند
      const res = await fetch("/api/auth/session");
      if (!res.ok) {
        set({ currentUser: null });
        return;
      }
      const data = await res.json();
      // data.user باید شکل { id, phone, role, avatarId? } باشد
      if (data?.user) {
        set({ currentUser: data.user as User });
      } else {
        set({ currentUser: null });
      }
    } catch (err) {
      console.error("fetchCurrentUser error:", err);
      set({ currentUser: null });
    }
  },
}));
