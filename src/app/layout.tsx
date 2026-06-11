import type { Metadata } from "next";
import localFont from "next/font/local";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { LanguageProvider } from "@/lib/providers/language-provider";

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Nexus — Enterprise Assessment Platform",
  description:
    "Precision assessment of human capability across six scientifically validated domains.",
};

/* Inline script that runs before React hydration to prevent theme/direction flash */
const antiFlashScript = `
(function(){
  try {
    var t = localStorage.getItem('nexus-theme') || 'dark';
    if (t === 'system') {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (t === 'dark') document.documentElement.classList.add('dark');
    var l = localStorage.getItem('nexus-lang') || 'en';
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = l;
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: antiFlashScript }} />
      </head>
      <body
        className={`${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
