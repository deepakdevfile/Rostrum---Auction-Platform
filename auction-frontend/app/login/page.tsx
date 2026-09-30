"use clinet";

import Link from "next/link";

export default function LoginPage() {
  return (
    <div>
      <h1>Sign in</h1>
      <form action="">
        <div>
          <label htmlFor="">Email</label>
          <input type="text" />
        </div>
        <div>
          <label htmlFor="">Password</label>
          <input type="text" />
        </div>
        <button>Sign in</button>
      </form>
      <p>
        New here? <Link href="/register">Create an account</Link>
      </p>
    </div>
  );
}
