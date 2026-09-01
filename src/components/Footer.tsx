import Image from "next/image";
import { brand } from "@/config/brand";

export function Footer() {
  return (
    <footer className="site-footer">
      <Image src={brand.logoPath} alt="TUN" width={54} height={38} />
      <a href="https://tunapp.com" target="_blank" rel="noreferrer">tunapp.com</a>
    </footer>
  );
}
