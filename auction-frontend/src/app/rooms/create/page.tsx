"use client";

import { useAuth } from "@/lib/auth-content";

export default function CreateRoomPage(){
    const { token, user } = useAuth();

    if(!user || !token){
        return <p className="text-dim">Sign in as a seller to list an item.</p>
    }

    return (
      <div className="mx-auto max-w-lg">
        <h1 className="font-display text-3xl text-paper">List an item</h1>
        <form action="" className="mt-8 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm text-dim">
              Lot title
            </label>
            <input
              type="text"
              className="mt-1 w-full border-hairline bg-surface px-3 py-2 text-paper focus: border-brass"
            />
          </div>
          <div>
            <label htmlFor="" className="block text-sm text-dim">
              Item name
            </label>
            <input
              type="text"
              className="mt-1 w-full border-hairline bg-surface px-3 py-2 text-paper focus: border-brass"
            />
          </div>
          <div>
            <label htmlFor="" className="block text-sm text-dim">
              Description
            </label>
            <textarea
              name=""
              id=""
              className="mt-1 w-full border-hairline bg-surface px-3 py-2 text-paper focus: border-brass"
            ></textarea>
          </div>
          <div>
            <label htmlFor="" className="block text-sm text-dim">
              Image URL
            </label>
            <input
              type="text"
              className="mt-1 w-full border-hairline bg-surface px-3 py-2 text-paper focus: border-brass"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="" className="block text-sm text-dim">
                Starting price
              </label>
              <input
                type="text"
                className="mt-1 w-full border-hairline bg-surface px-3 py-2 font-mono text-paper focus: border-brass"
              />
            </div>
            <div>
              <label htmlFor="" className="block text-sm text-dim">
                Bid increment
              </label>
              <input
                type="text"
                className="mt-1 w-full border-hairline bg-surface px-3 py-2 font-mono text-paper focus: border-brass"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="" className="block text-sm text-sim">
                Opens
              </label>
              <input
                type="text"
                className="mt-1 w-full border-hairline bg-surface px-3 py-2 text-paper focus: border-brass"
              />
            </div>
            <div>
              <label htmlFor="" className="block text-sm text-sim">
                Closes
              </label>
              <input
                type="text"
                className="mt-1 w-full border-hairline bg-surface px-3 py-2 text-paper focus: border-brass"
              />
            </div>
          </div>
          <button className="w-full bg-brass py-2.5 font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-50">Create lot</button>
        </form>
      </div>
    );
}