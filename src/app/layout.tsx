import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import { FavoritesProvider } from "@/context/FavoritesContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "SunuLamb - Billetterie au Senegal",
  description: "Billets evenements au Senegal.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2D75B6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <FavoritesProvider>
          <main className="max-w-lg mx-auto relative min-h-screen pb-20">
            {children}
          </main>
          <BottomNav />
        </FavoritesProvider>
      </body>
    </html>
  );
}
