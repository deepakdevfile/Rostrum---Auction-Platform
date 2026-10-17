'use client';

import { useEffect, useState } from "react";

function format(msRemaining: number): string {
    if(msRemaining <= 0){
        return "closed";
    }

    const totalSeconds = Math.floor(msRemaining/1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function Countdown({ endsAt }: { endsAt: string }){
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    const remaining = new Date(endsAt).getTime() - now;
    const urgent = remaining > 0 && remaining < 60_000;

    return (
        <span className={`font-mono num ${urgent ? "text-fall" : "text-paper"}`}>
            {format(remaining)}
        </span>
    )
}