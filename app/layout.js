import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Kontrakan App",
  description: "Aplikasi pengelolaan penghuni kontrakan dan pembayaran sewa.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col font-sans">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
