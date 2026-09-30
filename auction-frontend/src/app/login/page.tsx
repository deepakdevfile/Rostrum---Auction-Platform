"use clinet";

import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="font-display text-3xl text-paper">Sign in</h1>
      <form action="" className="mt-8 space-y-4">
        <div>
          <label className="block text-sm text-dim">Email</label>
          <input 
            type="text" 
            className="mt-1 w-full border border-hairline bg-surface px-3 py-2 text-paper focus: border-brass"
          />
        </div>
        <div>
          <label className="block text-sm text-dim">Password</label>
          <input 
            type="text" 
            className="mt-1 w-full border border-hairline bg-surface px-3 py-2 text-paper focus:border-brass"
          />
        </div>
        <button
            className="w-full bg-brass py-2.5 font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
            Sign in
        </button>
      </form>
      <p className="mt-6 text-sm text-dim">
        New here? <Link href="/register" className="text-brass">Create an account</Link>
      </p>
    </div>
  );
}
