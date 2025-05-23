// src/app/head.tsx
import type { Metadata } from "next";
import { NEXT_PUBLIC_URL } from "../config";

export const metadata: Metadata = {
  title: "ForkinWisdom",
  description: "ForkinWisdom",
  openGraph: {
    title: "ForkinWisdom",
    description: "ForkinWisdom",
    images: [`${NEXT_PUBLIC_URL}/vibes/vibes-19.png`],
  },
}; 