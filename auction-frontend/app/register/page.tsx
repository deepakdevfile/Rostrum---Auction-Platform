"use client";

import Link from "next/link";

export default function RegisterPage(){
    return(
        <div>
            <h1>Create an account</h1>
            <form action="">
                <div>
                    <label htmlFor="">Email</label>
                    <input type="text" />
                </div>
                <div>
                    <label htmlFor="">Username</label>
                    <input type="text" />
                </div>
                <div>
                    <label htmlFor="">Password</label>
                    <input type="text" />
                </div>
                <div>
                    <label htmlFor="">I mainly want to </label>
                    <select name="" id="">
                        <option value="">Bid on lots</option>
                        <option value="">Sell items</option>
                    </select>
                </div>
                <button>
                    Create account
                </button>
            </form>
            <p>
                Already have an account?{" "}
                <Link href="/login">
                    Sign in
                </Link>
            </p>
        </div>
    )
}