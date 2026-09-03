import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "مجموعه آثار ناصر صلب",
    template: "%s | مجموعه آثار ناصر صلب",
  },
  description:
    "مجموعه آثار ناصر صلب — آرشیو دیجیتال مجموعه‌های تاریخی و تجربه موزه‌ای",
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/brand/naser-solb-logo.png", type: "image/png" },
    ],
    apple: "/brand/naser-solb-logo.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className="h-full"
      suppressHydrationWarning
    >
      <body
        className="min-h-full bg-background font-sans text-text antialiased"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
