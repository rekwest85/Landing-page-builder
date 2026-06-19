import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forge — Build pages with AI",
  description: "The AI-native landing page builder.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0f] text-white antialiased">
        {children}
        <ToasterMount />
      </body>
    </html>
  );
}

// Mount the Sonner toast portal once at the root
import { Toaster } from "sonner";
function ToasterMount() {
  return (
    <Toaster
      position="bottom-right"
      theme="dark"
      toastOptions={{
        style: {
          background: "#14141a",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#fff",
        },
      }}
    />
  );
}
