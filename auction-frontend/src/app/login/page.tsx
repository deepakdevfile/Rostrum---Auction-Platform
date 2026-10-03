"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.SubmitEvent){
    e.preventDefault();
    setSubmitting(true);
    
    try{
      const res = await api.login(email, password);
    } catch(err){

    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="font-display text-3xl text-paper">Sign in</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm text-dim">Email</label>
          <input 
            type="email" 
            className="mt-1 w-full border border-hairline bg-surface px-3 py-2 text-paper focus: border-brass"
            value={email}
            required
            id="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm text-dim">Password</label>
          <input 
            type="password"
            required 
            className="mt-1 w-full border border-hairline bg-surface px-3 py-2 text-paper focus:border-brass"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brass py-2.5 font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
            { submitting ? "Signin in..." : "Sign in" }
        </button>
      </form>
      <p className="mt-6 text-sm text-dim">
        New here?{" "} <Link href="/register" className="text-brass">Create an account</Link>
      </p>
    </div>
  );
}
