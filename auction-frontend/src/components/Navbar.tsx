'use client'

import Link from "next/link";
import { useAuth } from "@/lib/auth-content";

export default function Navbar(){
    const { user, logout } = useAuth();
    return (
      <header className="border-b border-hairline">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="font-display text-xl tracking-tight text-paper"
          >
            Rostrum
          </Link>
          <nav className="flex items-center gap-6 text-sm text-dim">
            <Link href="/" className="hover: text-paper">
              Lots
            </Link>
            { user ? (
              <>
                <Link href="/rooms/create" className="hover: text-paper">
                  List an item
                </Link>
                <span className="text-paper">{user.username}</span>
                <button className="hover: text-paper" onClick={logout}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover: text-paper">
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-sm border border-brass px-3 py-1.5 text-brass hover:bg-brass hover:text-ink"
                >
                  Create account
                </Link>
              </>
            ) }
          </nav>
        </div>
      </header>
    );
}