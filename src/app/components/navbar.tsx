"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full px-4 py-3 flex justify-between items-center relative">
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

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-4">
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

      {/* Mobile Menu Button */}
      <button
        className="md:hidden p-2"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <div className="w-6 h-6 flex flex-col justify-center">
          <span className={`block w-full h-0.5 bg-white mb-1 transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`block w-full h-0.5 bg-white mb-1 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-full h-0.5 bg-white transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-sm border-t border-gray-800 md:hidden">
          <div className="p-4 flex flex-col gap-4">
            <div className="flex justify-center">
              <WalletMultiButton />
            </div>
            <div className="flex flex-col gap-2">
              {navBarLinks.map((link) => (
                <MenuButton
                  key={link.text}
                  logoName={link.logoName}
                  text={link.text}
                  href={link.href}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
