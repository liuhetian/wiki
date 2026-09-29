import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const incomingHeaders = await headers();
  const host = incomingHeaders.get("host") ?? "localhost:3000";
  const protocol = incomingHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const siteUrl = new URL(`${protocol}://${host}`);
  const socialImage = new URL("/og.png", siteUrl).toString();

  return {
    metadataBase: siteUrl,
    title: { default: "neat—annotations", template: "%s · neat—annotations" },
    description: "Hand-drawn CSS annotations with a human touch.",
    icons: { icon: "/favicon.svg" },
    openGraph: {
      type: "website",
      title: "neat—annotations · CSS with a human touch",
      description: "Hand-drawn labels and arrows. Pure CSS, zero dependencies.",
      images: [{ url: socialImage, width: 1717, height: 916, alt: "neat-annotations — CSS with a human touch" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "neat—annotations · CSS with a human touch",
      description: "Hand-drawn labels and arrows. Pure CSS, zero dependencies.",
      images: [socialImage],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Shantell+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/neat-annotations.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
