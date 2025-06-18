import "./globals.css";
import SessionProviderWrapper from "@/components/SessionWarpper";
import { ThemeWrapper } from "@/components/ThemeWrapper"

export const metadata = {
  title: process.env.NEXT_PUBLIC_UNI_NAME,
  description: `A Registration system for ${process.env.NEXT_PUBLIC_UNI_NAME} university`,
  icons: {
    icon: "/SUt.ico"
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`antialiased`}
      >
        <ThemeWrapper>
          <SessionProviderWrapper>
            {children}
          </SessionProviderWrapper> 
        </ThemeWrapper>
      </body>
    </html>
  );
}
