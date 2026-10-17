'use client'

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { api } from "@/lib/api";

import { Countdown } from "@/components/Countdown"
import type { RoomDetail } from "@/types/models";



export default function RoomPage(){
    const { id } = useParams<{ id: string }>();

    const [room, setRoom] = useState<RoomDetail | null>(null);
    // const [bids, setBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(!id){
            return;
        }
        Promise.all([api.getRoom(id)]) //api.getOrderBook(id)
          .then(([roomRes]) => {
            //bidsRes
            setRoom(roomRes);
            // setBids(bidsRes);
          })
          .finally(() => setLoading(false));
    }, [id]);

    if(loading){
        return (
            <p className="text-dim">Loading the floor...</p>
        )
    }

    if(!room){
        return (
            <p className="text-dim">This lot couldn't be found.</p>
        )
    }

    const item = room.items[0];

    return (
      <div>
        <div className="flex item-baseline justify-between border-hairline pb-6">
          <div>
            <h1 className="font-display text-3xl text-paper">{room.title}</h1>
            {item?.description && (
              <p className="mt-1 max-w-xl text-dim">{item.description} </p>
            )}
          </div>
          <div className="text-right text-sm text-dim">
            <div>Closes in</div>
            <div className="text-lg">
                <Countdown endsAt={room.ends_at} />
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg: grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            {item?.image_url && (
              <img
                src={item.image_url}
                alt={item.name}
                className="aspect-video w-full border border-hairline object-cover"
                referrerPolicy="no-referrer"
              />
            )}
            video room component
            <div className="h-64 border border-hairline bg-surface p-4">
              <div className="mb-2 text-sm text-dim">Price ticker</div>
              <div className="h-[calc(100%-1.5rem)]">price chart component</div>
            </div>
          </div>

          <div className="space-y-6">
            Bid panel component order book component winner status
          </div>
        </div>
      </div>
    );
}