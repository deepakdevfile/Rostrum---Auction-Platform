export type UserRole = "bidder" | "seller" | "admin";

export interface User {
    id: string;
    email: string;
    username: string;
    role: UserRole;
}