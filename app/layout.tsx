import type { Metadata } from "next";
import { Geist, Geist_Mono, Pacifico, Lora, Noto_Serif_KR } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { Analytics } from "@vercel/analytics/next";
import InAppRedirect from "@/components/InAppRedirect";
import "./globals.css";

const lora = Lora({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lora',
});

const notoSerifKr = Noto_Serif_KR({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-serif-kr',
});

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pacifico',
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://prayhouse.vercel.app"),
  title: "기도의 집",
  description: "감사일기, 선교일기, 기도제목을 함께 나누는 기도의 집입니다.",
  openGraph: {
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
  verification: {
    google: "4j3cTkVACL2lF9s0CFfg6x9kHsVdndQdbKI5atxdBGQ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pacifico.variable} ${lora.variable} ${notoSerifKr.variable} antialiased`}
      >
        <AuthProvider>
          <InAppRedirect />
          <div
            className="min-h-screen bg-[#f8f6f2]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 10%, rgba(251, 191, 36, 0.14), transparent 50%), radial-gradient(circle at 80% 0%, rgba(245, 158, 11, 0.12), transparent 45%)',
              backgroundAttachment: 'fixed',
            }}
          >
            {children}
          </div>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
