import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ height: "100%" }}>
      <body style={{ minHeight: "100%", width: "100%", margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}