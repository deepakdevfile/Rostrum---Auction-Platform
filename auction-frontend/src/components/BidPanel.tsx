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
        <div>
            <div>Current Prize</div>
            <div>${currentPrice.toLocaleString()}</div>

            <div>
                {connected ? "Connected to the floor" : "Reconnecting..."}
            </div>

            {rejection && (
                <div>
                    {REJECTION_COPY[rejection.reason] ?? rejection.reason}
                </div>
            )}

            {status !== "live" ? (
                <div>
                    {status === "scheduled" ? "Bidding opens when the floor goes live" : "Bidding has closed on this lot."}
                </div>
            ): !isAuthenticated ? (
                <div>Sign in to place a bid.</div>
            ) : (
                <div>
                    {quickAmounts.map((amount) => (
                        <button
                            key={amount}
                            onClick={() => onBid(amount)}
                            disabled={!connected}
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
                        />
                        <button
                            onClick={() => {
                                const value = parseFloat(customAmount);
                                if(!Number.isNaN(value)){
                                    onBid(value);
                                    setCustomAmount("")
                                }
                            }}
                            disabled={!connected}
                        >
                            Place bid
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}