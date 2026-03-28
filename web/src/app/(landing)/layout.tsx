'use client';
import { Header } from "@/components/LandingPage/HeaderSection";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <body>
    <Header onGetStarted={()=>{null}}/>
    {children}</body>;
}
