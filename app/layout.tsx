"use client"

import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from "sonner";
import ThemeProvider from '@/theme/theme-provider';
import localFont from "next/font/local";




const vazir = localFont({
  src: [
    {
      path: "../public/fonts/Vazirmatn/Vazirmatn-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Vazirmatn/Vazirmatn-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Vazirmatn/Vazirmatn-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Vazirmatn/Vazirmatn-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Vazirmatn/Vazirmatn-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-vazir",
  display: "swap",
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={vazir.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
export const dynamic = 'force-dynamic'
