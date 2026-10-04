export type UserRole = "bidder" | "seller" | "admin";

export interface User {
    id: string;
    email: string;
    username: string;
    role: UserRole;
}

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
    starting_price: number;
    bid_increment: number;
    starts_at: string;
    ends_at: string;
}

export interface RoomDetail extends Room {
    items: Item[];
}