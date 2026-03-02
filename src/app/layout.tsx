import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import MainWrapper from "@/components/layout/MainWrapper";


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
        <AuthProvider>
          <SettingsProvider>
            <FavoritesProvider>
              <MainWrapper>
                {children}
              </MainWrapper>
              <BottomNav />
            </FavoritesProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
