import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { getSystemSetting } from "@/app/actions";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export async function generateMetadata() {
  const branding = await getSystemSetting("logo_text") || "Flowt";
  return {
    title: {
      default: branding,
      template: `%s | ${branding}`,
    },
    description: "Modern Project Management",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased text-foreground selection:bg-blue-500/30 tracking-tight`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" theme="dark" />
        </ThemeProvider>
      </body>
    </html>
  );
}
