import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Frohe Ostern",
  description:
    "Eine kleine Osterseite mit Ostereiersuche, wechselnden Ostergrüßen und serverseitig gespeichertem Bestwert."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
