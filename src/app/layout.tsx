import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Medal Archive Pro",
    template: "%s | Medal Archive Pro",
  },
  description:
    "آرشیو حرفه‌ای مدال و سکه — پلتفرم مدیریت مجموعه و تجربه موزه‌ای دیجیتال",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /*
      Theme CSS variables are applied to <html> only after client mount
      (see preferences-store). suppressHydrationWarning is limited to <html>
      so React does not warn if attributes on this element differ briefly
      (theme prefs / browser extensions). RootLayout itself emits no dynamic attrs.
    */
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-text antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
