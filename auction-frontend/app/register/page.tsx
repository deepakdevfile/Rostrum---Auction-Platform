"use client";

import Link from "next/link";

export default function RegisterPage(){
    return (
      <div className="mx-auto max-w-sm">
        <h1 className="font-display text-3xl text-paper">Create an account</h1>
        <form action="" className="mt-8 space-y-4">
          <div>
            <label className="block text-sm text-dim">Email</label>
            <input
              type="text"
              className="mt-1 w-full border border-hairline bg-surface px-3 py-2 text-paper focus:border-brass"
            />
          </div>
          <div>
            <label className="block text-sm text-dim">Username</label>
            <input
              type="text"
              className="mt-1 w-full border border-hairline bg-surface px-3 py-2 text-paper focus: border-brass"
            />
          </div>
          <div>
            <label className="block text-sm text-dim">Password</label>
            <input
              type="text"
              className="mt-1 w-full border border-hairline bg-surface px-3 py-2 text-paper focus: border-brass"
            />
          </div>
          <div>
            <label className="block text-sm text-dim">I mainly want to </label>
            <select className="mt-1 w-full border border-hairline bg-surface px-3 py-2 text-paper focus: border-brass">
              <option value="">Bid on lots</option>
              <option value="">Sell items</option>
            </select>
          </div>
          <button className="w-full bg-brass py-2.5 font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-50">
            Create account
          </button>
        </form>
        <p className="mt-6 text-sm text-dim">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    );
}