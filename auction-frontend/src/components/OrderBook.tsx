import type { Bid } from "@/types/models"

export function OrderBook({ bids }: { bids: Bid[] }){
    return (
        <div className="border border-hairline bg-surface">
            <div className="border-b border-hairline px-4 py-3 text-sm text-dim">
                Order book
            </div>
            <div className="max-h-72 overflow-y-auto">
                {bids.length === 0 && (
                    <div className="px-4 py-6 text-sm text-dim">No bids yet - be the first.</div>
                )}
                {bids.map((bid) => (
                    <div 
                        key={bid.id}
                        className="flex items-center justify-between border-b border-hairline/60 px-4 py-2.5 text-sm"
                    >
                        <span className="font-mono text-dim">
                            {new Date(bid.created_at).toLocaleTimeString()}
                        </span>
                        <span className="font-mono text-dim">bidder {bid.bidder_id.slice(0, 8)}</span>
                        <span className="font-mono num text-paper">${bid.amount.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}