


export function VideoRoom(){
    return (
      <div className="border border-hairline bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-dim">Trading Floor</span>
          <div className="flex gap-2">
            {/* if joined ? screen share / stop button */}
            <button className="border border-hairline px-3 py-1 text-xs text-paper hover:border-brass"> screen share </button>
            <button className="border border-hairline px-3 py-1 text-xs text-paper hover:border-brass">
                {/* if joined  */}
                Leave / Join Call 
            </button>
          </div>
        </div>
        {/* if not joined ask them to join */}
        <div className="flex aspect-video items-center justify-center border border-dashed border-hairline text-sm text-dim">Join the call to see and hear the sellar live.</div>
        {/* if joined show them their and other peers video  */}
        <div className="grid grid-cols-2 gap-3">your video tile / peers video tile</div>
      </div>
    );
}