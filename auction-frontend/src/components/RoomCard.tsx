import Link from "next/link";

import type { Room } from "@/types/models"

const STATUS_LABEL: Record<Room["status"], string> = {
    scheduled: "Opens soon",
    live: "Live now",
    ended: "Closed",
    cancelled: "Cancelled",
};

const STATUS_COLOR: Record<Room["status"], string> = {
    scheduled: "text-dim",
    live: "text-rise",
    ended: "text-dim",
    cancelled: "text-fall",
};

export function RoomCard({ room, index }: { room: Room; index: number }){
    return (
      <Link 
        href={`/rooms/${room.id}`}
        className="group grid grid-cols-[3rem_1fr_auto_auto] itmes-center gap-6 border-b border-hairline py-5 transition-colors hover:bg-surface/60"
      >
        <span className="font-mono text-sm text-dim">{String(index + 1).padStart(3, "0")}</span>
        <span className="font-display text-lg text-paper group-hover:text-brass">{room.title}</span>
        <span className={`text-sm ${STATUS_COLOR[room.status]}`}>{STATUS_LABEL[room.status]} </span>
        <span className="font-mono num text-right text-lg text-paper">${room.current_price.toLocaleString()}</span>
      </Link>
    );
}