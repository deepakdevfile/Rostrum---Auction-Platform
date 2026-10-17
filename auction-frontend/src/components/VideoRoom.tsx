"use client";

import { useEffect, useRef } from "react";

function VideoTile({ stream, label, muted}: { stream: MediaStream; label: string; muted?: boolean}){
    const ref = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        if(ref.current){
            ref.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="realtive aspect-video overflow-hidden border border-hairline bg-ink">
            <video ref={ref} autoPlay playsInline muted={muted} className="h-full w-full object-cover" />
            <span className="absolute bottom-2 left-2 bg-ink/80 px-2 py-0.5 text-xs text-paper">
                {label}
            </span>
        </div>
    )
}


interface Props {
    localStream: MediaStream | null;
    remotePeers: { id: string; stream: MediaStream }[];
    joined: boolean;
    screenSharing: boolean;
    onJoin: () => void;
    onLeave: () => void;
    onToggleScreenShare: () => void;
}

export function VideoRoom({
    localStream, 
    remotePeers,
    joined,
    screenSharing,
    onJoin,
    onLeave,
    onToggleScreenShare,
}: Props){
    return (
      <div className="border border-hairline bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-dim">Trading Floor</span>
          <div className="flex gap-2">
            {joined && (
              <button  
                onClick={onToggleScreenShare}
                className="border border-hairline px-3 py-1 text-xs text-paper hover:border-brass"
                >
                {screenSharing ? "Stop sharing" : "Share screen"}
              </button>
            )}

            <button
                onClick={joined ? onLeave : onJoin} 
                className="border border-hairline px-3 py-1 text-xs text-paper hover:border-brass">
              {joined ? "Leave call" : "Join call"}
            </button>
          </div>
        </div>

        {!joined ? (
          <div className="flex aspect-video items-center justify-center border border-dashed border-hairline text-sm text-dim">
            Join the call to see and hear the sellar live.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {localStream && <VideoTile stream={localStream} label="You" muted />}
            {remotePeers.map((peer) => (
                <VideoTile key={peer.id} stream={peer.stream} label={`Peer ${peer.id.slice(0, 6)}`} />
            ))}
          </div>
        )}
      </div>
    );
}