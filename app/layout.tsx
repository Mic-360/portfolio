import type { Metadata } from "next";
import { Fira_Code, Open_Sans } from "next/font/google";
import "./globals.css";
import { Footer, Header } from "@/components/Outlet";

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});
const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${firaCode.variable} ${openSans.variable}`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
