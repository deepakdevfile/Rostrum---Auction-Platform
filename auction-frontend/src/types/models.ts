export type UserRole = "bidder" | "seller" | "admin";

export interface User {
    id: string;
    email: string;
    username: string;
    role: UserRole;
}

export type RoomStatus = "scheduled" | "live" | "ended" | "cancelled";

export interface Item {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
}

export interface Room {
    id: string, 
    seller_id: string,
    title: string,
    description: string | null;
    status: RoomStatus;
    starting_price: number;
    current_price: number;
    bid_increment: number;
    winner_id: string | null;
    version: number;
    starts_at: string;
    ends_at: string;
}

export interface RoomDetail extends Room {
    items: Item[];
}

export type SignalMessage = 
    | { type: "peer_joined"; from_peer: string; role: string }
    | { type: "peer_left"; from_peer: string }
    | { type: "offer"; from_peer: string; sdp: RTCSessionDescriptionInit; to_peer?: string }
    | { type: "answer"; from_peer: string; sdp: RTCSessionDescriptionInit; to_peer?: string }
    | { type: "ice_candidate"; from_peer: string; candidate: RTCIceCandidateInit; to_peer?: string }