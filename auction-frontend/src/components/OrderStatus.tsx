"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Order } from "@/types/models";

const MAX_ATTEMPTS = 10;
const RETRY_MS = 2000;

export function OrderStatus({ roomId, token }: { roomId: string; token: string }){
    const [order, setOrder] = useState<Order | null>(null);
    const [gaveUp, setGaveUp] = useState(false);

    useEffect(() => {
        let cancelled = false;
        let timer: ReturnType<typeof setTimeout>;

        async function poll(attempt: number){
            try{
                const result = await api.getOrderForRoom(token, roomId);
                if(!cancelled){
                    setOrder(result);
                }
            } catch(err){
                if (cancelled) {
                    return;
                }
                const notYet = err instanceof ApiError && err.status === 404;
                if(notYet && attempt < MAX_ATTEMPTS){
                    timer = setTimeout(() => poll(attempt + 1), RETRY_MS);
                } else {
                    setGaveUp(true);
                }
            }
        }

        poll(1);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        }
    }, [roomId, token])

    if(gaveUp){
        return (
            <div>
                Your order is still being processed. Refresh in a moment.
            </div>
        )
    }

    if(!order) {
        return (
            <div>
                You won this lot. Creating you order...
            </div>
        )
    }

    const lastPayment = order.payments[order.payments.length - 1];

    return (
        <div>
            <div>Tou won this lot.</div>
            <div>
                <span>Order total</span>
                <span>${order.amount.toLocaleString()}</span>
            </div>
            <div>
                <span>Payment</span>
                <span>
                    {order.status}
                </span>
            </div>
            {order.status === "failed" && lastPayment?.failure_reason && (
                <div>Reason: {lastPayment.failure_reason}</div>
            )}
        </div>
    )
}