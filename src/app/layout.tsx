import ClientLayout from "@/components/ClientLayout";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { Metadata } from "next";
import { Lato, Roboto } from "next/font/google";
import { ReactNode } from 'react';

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
  children: ReactNode;
}>) {
  const locations = await prisma.location.findMany();
  const majors = await prisma.major.findMany();
  const { isAdmin, locationId, teacherId, userId } = await getSession();

  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${latoSans.variable} ${robotoSans.variable} antialiased`}
      >
        <ClientLayout
          locations={locations}
          majors={majors}
          locationId={locationId!}
          isAdmin={isAdmin}
          userId={userId}
          teacherId={teacherId}
        >
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
