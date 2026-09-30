'use client'

import Link from "next/link";

export default function Navbar(){
    return(
        <header>
            <div>
                <Link href="/">
                    Rostrum
                </Link>
                <nav>
                    <Link href="/">
                        Lots
                    </Link>
                    <>
                        <Link href="/login">
                            Sign in
                        </Link>
                        <Link href="/register">
                            Create account
                        </Link>
                    </>
                </nav>
            </div>
        </header>
    );
}