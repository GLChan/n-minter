import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@rainbow-me/rainbowkit/styles.css";
import Web3Provider from "@/providers/Web3Provider";
import "./globals.css";
import { Navbar } from "./_components/Navbar";
import { Footer } from "./_components/Footer";
import { Toaster } from "react-hot-toast";
import { UserProvider } from "@/contexts/UserContext";

export const metadata: Metadata = {
  title: "NFT铸造平台 | 创建、分享和铸造NFT",
  description: "简单几步，将您的创意铸造为NFT，立即加入Web3数字艺术的世界。",
  keywords: "NFT, 铸造, 数字艺术, Web3, 区块链, 以太坊",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* <NextIntlClientProvider> */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#333",
              color: "#fff",
              borderRadius: "8px",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />

        <Web3Provider>
          <UserProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />

              <main className="flex-grow">{children}</main>

              <Footer />
            </div>
          </UserProvider>
        </Web3Provider>
        {/* </NextIntlClientProvider> */}
      </body>
    </html>
  );
}
