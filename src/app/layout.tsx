import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CheckInQR - Akıllı Personel Devam Kontrol Sistemi",
  description:
    "Fiziksel turnike sistemi olmadan, tamamen dijital, donanım-mobil-web üçgeninde çalışan yeni nesil personel giriş çıkış takip sistemi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
