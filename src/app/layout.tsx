import type { Metadata } from "next";
import { Lato, Roboto } from "next/font/google";
import "./globals.css";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

const latoSans = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

const robotoSans = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Piano Together",
  description: "피아노투게더",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return redirect("/login");
  }
  return (
    <html lang="ko">
      <body
        className={`${latoSans.variable} ${robotoSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
