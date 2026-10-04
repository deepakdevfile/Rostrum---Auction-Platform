"use client";

import { useAuth } from "@/lib/auth-content";
import { useState } from "react";

function toLocalInputValue(date: Date): string {
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60_000);
    return local.toISOString().slice(0, 16);
}

export default function CreateRoomPage(){
    const { token, user } = useAuth();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [itemName, setItemName] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [startingPrice, setStartingPrice] = useState("100");
    const [bidIncrement, setBidIncrement] = useState("10");
    const [startsAt, setStartsAt] = useState(toLocalInputValue(new Date(Date.now() + 5 * 60_000)));
    const [endsAt, setEndsAt] = useState(toLocalInputValue(new Date(Date.now() + 65 * 60_000)));
    const [submitting, setSubmitting] = useState(false);

    if(!user || !token){
        return <p className="text-dim">Sign in as a seller to list an item.</p>
    }

    async function handleSubmit(e: React.SubmitEvent){
        e.preventDefault();
    //   console.log(title);
    //   console.log(description);
    //   console.log(itemName);
    //   console.log(imageUrl);
    //   console.log(startingPrice);
    //   console.log(bidIncrement);
    //   console.log(startsAt);
    //   console.log(endsAt);
        setSubmitting(true);
        try{

        } catch {

        } finally{
            setSubmitting(false);
        }
    }

    return (
      <div className="mx-auto max-w-lg">
        <h1 className="font-display text-3xl text-paper">List an item</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm text-dim">
              Lot title
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              id="title"
              className="mt-1 w-full border-hairline bg-surface px-3 py-2 text-paper focus: border-brass"
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm text-dim">
              Item name
            </label>
            <input
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              id="name"
              className="mt-1 w-full border-hairline bg-surface px-3 py-2 text-paper focus: border-brass"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm text-dim">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              id="description"
              className="mt-1 w-full border-hairline bg-surface px-3 py-2 text-paper focus: border-brass"
            ></textarea>
          </div>
          <div>
            <label htmlFor="imageURL" className="block text-sm text-dim">
              Image URL
            </label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              id="imageURL"
              className="mt-1 w-full border-hairline bg-surface px-3 py-2 text-paper focus: border-brass"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="starting_price"
                className="block text-sm text-dim"
              >
                Starting price
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                id="starting_price"
                className="mt-1 w-full border-hairline bg-surface px-3 py-2 font-mono text-paper focus: border-brass"
              />
            </div>
            <div>
              <label htmlFor="bid_increment" className="block text-sm text-dim">
                Bid increment
              </label>
              <input
                type="number"
                min={0.01}
                step={0.01}
                required
                value={bidIncrement}
                onChange={(e) => setBidIncrement(e.target.value)}
                id="bid_increment"
                className="mt-1 w-full border-hairline bg-surface px-3 py-2 font-mono text-paper focus: border-brass"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="opens" className="block text-sm text-sim">
                Opens
              </label>
              <input
                type="datetime-local"
                required
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                id="opens"
                className="mt-1 w-full border-hairline bg-surface px-3 py-2 text-paper focus: border-brass"
              />
            </div>
            <div>
              <label htmlFor="closes" className="block text-sm text-sim">
                Closes
              </label>
              <input
                type="datetime-local"
                required
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                id="closes"
                className="mt-1 w-full border-hairline bg-surface px-3 py-2 text-paper focus: border-brass"
              />
            </div>
          </div>
          <button 
            type="submit"
            className="w-full bg-brass py-2.5 font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-50">
            Create lot
          </button>
        </form>
      </div>
    );
}