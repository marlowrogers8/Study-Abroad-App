"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { MenuIcon } from "./icons";

const navLinks = [
  { label: "Programs", href: "/programs" },
  { label: "Destinations", href: "/#destinations" },
  { label: "Reviews", href: "/#why" },
  { label: "How it works", href: "/#how" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-100/70 bg-white/80 backdrop-blur-md">
      <nav
        className="container-page flex h-16 items-center justify-between"
        aria-label="Primary"
      >
        <a href="#top" className="rounded-lg" aria-label={`${"Abroadly"} home`}>
          <Logo />
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/signin"
            className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:text-ink-900"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-ink-800 hover:shadow"
          >
            Get started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-ink-700 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-ink-100 bg-white md:hidden">
          <ul className="container-page flex flex-col gap-1 py-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="mt-2 flex gap-3 px-2">
              <Link
                href="/signin"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg border border-ink-200 px-4 py-2.5 text-center text-sm font-semibold text-ink-800"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg bg-ink-900 px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                Get started
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
