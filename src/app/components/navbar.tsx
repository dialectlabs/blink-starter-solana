"use client";

import Image from "next/image";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { MenuButton } from "@/app/components/menu-button";

const navBarLinks = [
  {
    logoName: "logo-github",
    text: "View code",
    href: "https://github.com/dialectlabs/blink-starter-solana",
  },
  {
    logoName: "logo-frame",
    text: "Guide",
    href: "https://docs.dialect.to/blinks/blinks-provider/build-your-first-blink",
  },
  {
    logoName: "logo-readme",
    text: "Register blink",
    href: "https://terminal.dial.to",
  },
  {
    logoName: "logo-globe",
    text: "Explore blinks",
    href: "https://dial.to",
  },
];

export function Navbar() {
  return (
    <nav className="w-full px-4 py-3 flex justify-between items-center ">
      {/* Dialect Logo */}
      <Link
        href="https://www.dialect.to/"
        className="flex items-center h-[30px] w-[250px]"
      >
        <Image
          src="/dialect-solana-logo.png"
          alt="Dialect Logo"
          width={250}
          height={30}
          className="object-contain"
        />
      </Link>

      {/* Social Links and Connect Button */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {navBarLinks.map((link) => (
            <MenuButton
              key={link.text}
              logoName={link.logoName}
              text={link.text}
              href={link.href}
            />
          ))}
        </div>
        <WalletMultiButton />
      </div>
    </nav>
  );
}
