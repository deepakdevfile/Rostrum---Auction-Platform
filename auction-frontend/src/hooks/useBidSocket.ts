"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { wsUrl } from "@/lib/api";
import { RoomStatus, BidSocketServerMessage } from "@/types/models";

interface RoomLiveState {
    currentPrice: number;
    version: number;
    status: RoomStatus | null;
}

interface RejectionInfo {
    reason: string,
    currentPrice: number;
    minNextBid: number;
}

export function useBidSocket(roomId: string, token: string | null){
    const [connected, setConnected] = useState(false);
    const [liveState, setLiveState] = useState<RoomLiveState>({
        currentPrice: 0,
        version: 0,
        status: null,
    });
    const [lastBid, setLastBid] = useState<BidSocketServerMessage | null>(null);
    const [rejection, setRejection] = useState<RejectionInfo | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const attemptRef = useRef(0);
    const manuallyClosedRef = useRef(false);

    useEffect(() => {
        if(!token || !roomId){
            return;
        }
        manuallyClosedRef.current = false;

        function connect(){
            const ws = new WebSocket(wsUrl(`/ws/rooms/${roomId}/bids`, token!));
            wsRef.current = ws;

            ws.onopen = () => {
                setConnected(true);
                attemptRef.current = 0;
            };

            ws.onmessage = (event) => {
                const msg: BidSocketServerMessage = JSON.parse(event.data);
                if(msg.type == "sync"){
                    setLiveState({
                        currentPrice: msg.current_price,
                        version: msg.version,
                        status: msg.status,
                    });
                } else if (msg.type === "bid_accepted"){
                    setLiveState((prev) => ({
                        ...prev,
                        currentPrice: msg.current_price,
                        version: msg.version,
                    }));
                    setLastBid(msg);
                    setRejection(null);
                } else if (msg.type === "bid_rejected"){
                    setRejection({
                      reason: msg.reason,
                      currentPrice: msg.current_price,
                      minNextBid: msg.min_next_bid,
                    });
                } else if (msg.type === "room_status"){
                    setLiveState((prev) => ({ ...prev, status: msg.status }));
                }
            };

            ws.onclose = () => {
                setConnected(false);
                wsRef.current = null;
                if(manuallyClosedRef.current){
                    return;
                }
                const delay = Math.min(10_000, 500 * 2 ** attemptRef.current);
                attemptRef.current += 1;
                setTimeout(connect, delay);
            };
        }

        connect();
        return () => {
            manuallyClosedRef.current = true;
            wsRef.current?.close();
        };
    }, [roomId, token]);

    const placeBid = useCallback((amount: number) => {
        if(wsRef.current?.readyState !== WebSocket.OPEN){
            return false;
        }
        const clientRef = crypto.randomUUID();
        wsRef.current.send(JSON.stringify({ amount, client_ref: clientRef }));
        return true;
    }, [])

    return { connected, liveState, lastBid, rejection, placeBid }
}