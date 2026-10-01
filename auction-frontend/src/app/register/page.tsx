"use client";

import Link from "next/link";
import React, { useState } from "react";
import { UserRole } from "@/types/models";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-content";
import { api } from "@/lib/api";

export default function RegisterPage(){
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<UserRole>("bidder");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();
    const { setSession } = useAuth();

    async function handleSubmit(e: React.SubmitEvent){
      e.preventDefault();
      // console.log(email);
      // console.log(username);
      // console.log(password);
      // console.log(role);
      setSubmitting(true);
      setError(null);
      try{
        const res = await api.register(email, username, password, role)
        // console.log(res);
        setSession(res.access_token, res.user);
        router.push("/")
      } catch{
        setError("Couldn't create that account. The email or username may already e taken.");
      } finally{
        setSubmitting(false);
      }
    }

    return (
      <div className="mx-auto max-w-sm">
        <h1 className="font-display text-3xl text-paper">Create an account</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-dim">
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-hairline bg-surface px-3 py-2 text-paper focus:border-brass"
            />
          </div>
          <div>
            <label htmlFor="username" className="block text-sm text-dim">
              Username
            </label>
            <input
              type="text"
              id="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full border border-hairline bg-surface px-3 py-2 text-paper focus: border-brass"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-dim">
              Password
            </label>
            <input
              type="text"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-hairline bg-surface px-3 py-2 text-paper focus: border-brass"
            />
          </div>
          <div>
            <label className="block text-sm text-dim">I mainly want to </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="mt-1 w-full border border-hairline bg-surface px-3 py-2 text-paper focus: border-brass"
            >
              <option value="bidder">Bid on lots</option>
              <option value="seller">Sell items</option>
            </select>
          </div>
          {error && <p className="text-sm text-fall">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brass py-2.5 font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Create account
          </button>
        </form>
        <p className="mt-6 text-sm text-dim">
          Already have an account?{" "} <Link href="/login" className="text-brass">Sign in</Link>
        </p>
      </div>
    );
}