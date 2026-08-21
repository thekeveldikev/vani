import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VANI",
  description: "Ein privates Zuhause zum Schreiben – offline und auf deinen Geräten synchron.",
  icons: {
    icon: "/icons/icon-192.png",
    shortcut: "/icons/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
