import "./globals.css";
import SessionProviderWrapper from "@/components/SessionWarpper";
import { ThemeWrapper } from "@/components/ThemeWrapper"

export const metadata = {
  title: "Samar University Registration",
  description: "A Registration system for Samara university",
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
