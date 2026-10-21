'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-content";
import { useBidSocket } from "@/hooks/useBidSocket";
import { usePriceTicker } from "@/hooks/usePriceTicker";
import { useWebRTC } from "@/hooks/useWebRTC";
import { BidPanel } from "@/components/BidPanel";
import { OrderBook } from "@/components/OrderBook";
import { PriceChart } from "@/components/PriceChart";
import { VideoRoom } from "@/components/VideoRoom";
import { Countdown } from "@/components/Countdown";
import type { RoomDetail, Bid } from "@/types/models";

export default function RoomPage(){
    const { id } = useParams<{ id: string }>();
    const { user, token } = useAuth();

    const [room, setRoom] = useState<RoomDetail | null>(null);
    const [bids, setBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(!id){
            return;
        }
        Promise.all([api.getRoom(id), api.getOrderBook(id)])
          .then(([roomRes, bidsRes]) => {
            setRoom(roomRes);
            setBids(bidsRes);
          })
          .finally(() => setLoading(false));
    }, [id]);

    const { connected, liveState, lastBid, rejection, placeBid } = useBidSocket(id, token);
    const { ticks } = usePriceTicker(id);
    const rtc = useWebRTC(id, token, user?.id ?? null)

    useEffect(() => {
      if(lastBid?.type !== "bid_accepted"){
        return;
      }
      setBids((prev) => {
        if(prev.some((b) => b.id === lastBid.bid.id)){
          return prev;
        }
        return [
          {
            id: lastBid.bid.id,
            room_id: lastBid.room_id,
            bidder_id: lastBid.bid.bidder_id,
            amount: lastBid.bid.amount,
            room_version: lastBid.version,
            created_at: lastBid.bid.created_at,
          },
          ...prev
        ];
      });
    }, [lastBid]);

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

    const currentPrice = liveState.status ? liveState.currentPrice : room.current_price;
    const status = liveState.status ?? room.status;
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

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            {item?.image_url && (
              <img
                src={item.image_url}
                alt={item.name}
                className="aspect-video w-full border border-hairline object-cover"
                referrerPolicy="no-referrer"
              />
            )}
            <VideoRoom
              localStream={rtc.localStream}
              remotePeers={rtc.remotePeers}
              joined={rtc.joined}
              screenSharing={rtc.screenSharing}
              onJoin={rtc.join}
              onLeave={rtc.leave}
              onToggleScreenShare={rtc.toggleScreenShare}
            />

            <div className="h-64 border border-hairline bg-surface p-4">
              <div className="mb-2 text-sm text-dim">Price ticker</div>
              <div className="h-[calc(100%-1.5rem)]">
                <PriceChart ticks = {ticks} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <BidPanel 
              currentPrice = {currentPrice}
              bidIncrement = {room.bid_increment}
              status = {status}
              connected = {connected}
              rejection = {rejection}
              onBid = {placeBid}
              isAuthenticated = {!!user}
            />
            <OrderBook bids={bids} /> 
            
            winner status
          </div>
        </div>
      </div>
    );
}