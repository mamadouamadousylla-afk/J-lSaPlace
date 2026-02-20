import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SunuLamb | Billetterie Lutte Sénégalaise",
  description: "Achetez vos tickets pour les plus grands combats de lutte sénégalaise en quelques clics.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#1B8B3D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body
        className={cn(
          inter.variable,
          poppins.variable,
          "font-inter antialiased bg-background text-foreground h-full overflow-x-hidden relative"
        )}
      >
        {/* Background Watermark - Source: fond-lamb-source.png */}
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.04] z-[-1]"
          style={{
            backgroundImage: "url(/fond-lamb.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}
        />

        <main className="min-h-full pb-20 relative z-10">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
