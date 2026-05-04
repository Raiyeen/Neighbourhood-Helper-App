import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { SocketProvider } from "@/components/providers/socket-provider";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Neighbourhood Helper App",
  description: "A community app to help neighbours connect and support each other.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 text-gray-900 antialiased`}>
        <SocketProvider>
          <div className="flex flex-col min-h-[100dvh] w-full max-w-md mx-auto bg-white relative shadow-2xl overflow-x-hidden">
            <TopBar />
            <main className="flex-1 w-full pt-16 pb-20 overflow-y-auto no-scrollbar">
              {children}
            </main>
            <BottomNav />
          </div>
        </SocketProvider>
      </body>
    </html>
  );
}
