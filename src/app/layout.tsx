import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { DBProvider } from "@/context/DBContext";
import { CartProvider } from "@/context/CartContext";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Muebles & Cadeiras Paraguai | E-Commerce Premium",
  description: "Compre móveis e cadeiras premium para sua casa ou escritório no Paraguai. Experiência de compra rápida, simples e transparente.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-primary-dark font-sans">
        <DBProvider>
          <LanguageProvider>
            <CartProvider>
              <div className="flex-1 flex flex-col">
                {children}
              </div>
              <WhatsAppButton />
            </CartProvider>
          </LanguageProvider>
        </DBProvider>
      </body>
    </html>
  );
}
