"use client";

import { useState, useEffect, useRef } from "react";
import { sseUrl } from "@/lib/api";
import { PriceTick } from "@/types/models";

const MAX_HISTORY = 200;

export function usePriceTicker(roomId: string){
    const [ticks, setTicks] = useState<PriceTick[]>([]);
    const [connected, setConnected] = useState(false);
    const sourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        if(!roomId){
            return;
        }

        const source = new EventSource(sseUrl(roomId));
        sourceRef.current = source;

        source.onopen = () => setConnected(true);
        source.onerror = () => setConnected(false);

        source.addEventListener("tick", (event) => {
            const tick: PriceTick = JSON.parse((event as MessageEvent).data);
            setTicks((prev) => [...prev.slice(-(MAX_HISTORY - 1)), tick]);
        });

        return () => source.close();
    }, [roomId]);

    return { ticks, connected };
}