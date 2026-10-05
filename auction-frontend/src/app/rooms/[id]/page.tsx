



export default function RoomPage(){
    return (
        <div>
            <div className="flex item-baseline justify-between border-hairline pb-6">
                <div>
                    <h1 className="font-display text-3xl text-paper">room title</h1>
                    <p className="mt-1 max-w-xl text-dim">item description </p>
                </div>
                <div className="text-right text-sm text-dim">
                    <div>Closes in</div>
                    <div className="text-lg">
                        Count Down component
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg: grid-cols-[2fr_1fr]">
                <div className="space-y-6">
                    item images
                    video room component 

                    <div className="h-64 border border-hairline bg-surface p-4">
                        <div className="mb-2 text-sm text-dim">Price ticker</div>
                        <div className="h-[calc(100%-1.5rem)]">
                            price chart component
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    Bid panel component
                    order book component
                    winner status 
                </div>
            </div>
        </div>
    )
}