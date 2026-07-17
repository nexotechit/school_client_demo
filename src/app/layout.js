import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutClient from "../../components/LayoutClient";
import Providers from "../components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sunlight School Management System",
  description: "Professional school management system with advanced caching",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sunlight SMS",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Sunlight School Management System",
    title: "Sunlight School Management System",
    description: "Professional school management system with advanced caching",
  },
  twitter: {
    card: "summary",
    title: "Sunlight School Management System",
    description: "Professional school management system with advanced caching",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3b82f6",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <LayoutClient>{children}</LayoutClient>
        </Providers>
      </body>
    </html>
  );
}
