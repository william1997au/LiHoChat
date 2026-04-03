import "./globals.css";

export const metadata = {
  title: "LiHoChat",
  description: "Realtime chat portfolio project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
