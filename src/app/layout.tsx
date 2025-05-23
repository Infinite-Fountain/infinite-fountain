import type { Metadata } from "next";
import { NEXT_PUBLIC_URL } from "../config";
import "./global.css";
import "@coinbase/onchainkit/styles.css";
import "@rainbow-me/rainbowkit/styles.css";
import dynamic from "next/dynamic";

const ClientRoot = dynamic(
  () => import("src/components/ClientRoot").then((m) => m.default),
  { ssr: false }
);

export const viewport = { width: "device-width", initialScale: 1.0 };

export const metadata: Metadata = {
  title: "ForkinWisdom",
  description: "ForkinWisdom",
  openGraph: {
    title: "ForkinWisdom",
    description: "ForkinWisdom",
    images: [`${NEXT_PUBLIC_URL}/vibes/vibes-19.png`],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex items-center justify-center">
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
