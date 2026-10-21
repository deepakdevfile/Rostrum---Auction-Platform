"use client";

import { useState } from "react";
import type { RoomStatus } from "@/types/models"

interface Props {
    currentPrice: number;
    bidIncrement: number;
    status: RoomStatus | null;
    connected: boolean;
    rejection: { reason: string; currentPrice: number; minNextBid: number } | null;
    onBid: (amount: number) => void;
    isAuthenticated: boolean;
}

const REJECTION_COPY: Record<string, string> = {
    bid_too_low: "Someone bid first - try the updated amount below.",
    room_not_live: "This lot isn't open for bidding right now.",
    room_not_found: "This lot couldn't be found.",
    too_much_contention: "Bidding is moving fast - try again.",
}

export function BidPanel({
    currentPrice,
    bidIncrement,
    status,
    connected, 
    rejection, 
    onBid, 
    isAuthenticated,
}: Props){
    const minNext = currentPrice + bidIncrement;
    const [customAmount, setCustomAmount] = useState<string>("")

    const quickAmounts = [minNext, minNext + bidIncrement, minNext + 4 * bidIncrement];

    return (
      <div className="border border-hairline bg-surface p-6">
        <div className="text-sm text-dim">Current Prize</div>
        <div className="mt-1 font-mono num text-4xl text-paper">
          ${currentPrice.toLocaleString()}
        </div>

        <div className="mt-1 text-xs text-dim">
          {connected ? "Connected to the floor" : "Reconnecting..."}
        </div>

        {rejection && (
          <div className="mt-4 border border-fall/40 bg-fall/10 px-3 py-2 text-sm text-fall">
            {REJECTION_COPY[rejection.reason] ?? rejection.reason}
          </div>
        )}

        {status !== "live" ? (
          <div className="mt-6 text-sm text-dim">
            {status === "scheduled"
              ? "Bidding opens when the floor goes live"
              : "Bidding has closed on this lot."}
          </div>
        ) : !isAuthenticated ? (
          <div className="mt-6 text-sm text-dim">Sign in to place a bid.</div>
        ) : (
          <div className="mt-6 space-y-2">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => onBid(amount)}
                disabled={!connected}
                className="w-full border border-hairline py-2 font-mono num text-paper transition-colors hover:broder-brass hover:text-brass disabled:opacity-40"
              >
                Bid ${amount.toLocaleString()}
              </button>
            ))}

            <div>
              <input
                type="number"
                min={minNext}
                step={bidIncrement}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder={`${minNext} or more`}
                className="w-full border border-hairline bg-ink px-3 py-2 font-mono num text-paper placeholder:text-dim focus:border-brass"
              />
              <button
                onClick={() => {
                  const value = parseFloat(customAmount);
                  if (!Number.isNaN(value)) {
                    onBid(value);
                    setCustomAmount("");
                  }
                }}
                disabled={!connected}
                className="shrink-0 bg-brass px-4 font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                Place bid
              </button>
            </div>
          </div>
        )}
      </div>
    );
}