import "./globals.css";

export const metadata = {
  title: "LiHoChat",
  description: "Realtime chat portfolio project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
