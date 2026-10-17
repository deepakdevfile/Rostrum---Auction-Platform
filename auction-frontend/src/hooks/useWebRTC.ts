"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { wsUrl } from "@/lib/api";
import { api } from "@/lib/api";
import type { SignalMessage } from "@/types/models";

interface RemotePeer {
    id: string;
    stream: MediaStream;
}

export function useWebRTC(roomId: string, token: string | null, myPeerId: string | null){
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remotePeers, setRemotePeers] = useState<RemotePeer[]>([]);
    const [joined, setJoined] = useState(false);
    const [screenSharing, setScreenSharing] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const iceServersRef = useRef<RTCIceServer[]>([{ urls: "stun:stun.l.google.com:19302"}]);
    const localStreamRef = useRef<MediaStream | null>(null);
    const cameraTrackRef = useRef<MediaStreamTrack | null>(null);

    const upsertRemotePeer = (id: string, stream: MediaStream) => {
        setRemotePeers((prev) => {
            const others = prev.filter((p) => p.id !== id);
            return [...others, { id, stream }];
        });
    }

    const removeRemotePeer = (id: string) => {
        setRemotePeers((prev) => prev.filter((p) => p.id !== id));
    };

    const createPeerConnection = useCallback((peerId: string): RTCPeerConnection => {
        const pc = new RTCPeerConnection({ iceServers: iceServersRef.current });

        localStreamRef.current?.getTracks().forEach((track) => {
            pc.addTrack(track, localStreamRef.current!);
        });

        pc.ontrack = (event) => {
            upsertRemotePeer(peerId, event.streams[0]);
        };

        pc.onicecandidate = (event) => {
            if(event.candidate && wsRef.current?.readyState === WebSocket.OPEN){
                const msg: SignalMessage = {
                    type: "ice_candidate",
                    from_peer: myPeerId!,
                    candidate: event.candidate.toJSON(),
                    to_peer: peerId,
                };
                wsRef.current.send(JSON.stringify(msg));
            }
        };

        pc.onconnectionstatechange = () => {
            if(["closed", "failed", "disconnected"].includes(pc.connectionState)){
                removeRemotePeer(peerId);
            }
        };

        pcsRef.current.set(peerId, pc);
        return pc;
    }, [myPeerId])
    
    const join = useCallback(async() => {
        if(!roomId || !token || !myPeerId){
            return;
        }

        try {
            const { iceServers } = await api.iceConfig();
            
            if(iceServers?.length){
                iceServersRef.current = iceServers;
            }
        } catch {

        }

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        })
        localStreamRef.current = stream;
        cameraTrackRef.current = stream.getVideoTracks()[0] ?? null;
        setLocalStream(stream);

        const ws = new WebSocket(wsUrl(`/ws/rooms/${roomId}/webrtc`, token));
        wsRef.current = ws;

        ws.onmessage = async (event) => {
            const msg: SignalMessage = JSON.parse(event.data);

            if(msg.from_peer === myPeerId){
                return;
            }

            if("to_peer" in msg && msg.to_peer && msg.to_peer !== myPeerId){
                return; 
            }

            if(msg.type === "peer_joined"){
                const pc = createPeerConnection(msg.from_peer);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                ws.send(
                    JSON.stringify({
                        type: "offer",
                        from_peer: myPeerId,
                        sdp: offer,
                        to_peer: msg.from_peer,
                    } satisfies SignalMessage)
                );
            } else if(msg.type === "offer"){
                const pc = createPeerConnection(msg.from_peer);
                await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                ws.send(
                    JSON.stringify({
                        type: "answer",
                        from_peer: myPeerId,
                        sdp: answer,
                        to_peer: msg.from_peer,
                    } satisfies SignalMessage)
                );
            } else if (msg.type === "answer"){
                const pc = pcsRef.current.get(msg.from_peer);
                await pc?.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            } else if (msg.type === "ice_candidate"){
                const pc = pcsRef.current.get(msg.from_peer);
                await pc?.addIceCandidate(new RTCIceCandidate(msg.candidate));
            } else if (msg.type === "peer_left"){
                pcsRef.current.get(msg.from_peer)?.close();
                pcsRef.current.delete(msg.from_peer);
                removeRemotePeer(msg.from_peer);
            }
        };

        setJoined(true);
    }, [roomId, token, myPeerId, createPeerConnection]);

    const leave = useCallback(() => {
        wsRef.current?.close();
        wsRef.current = null;
        pcsRef.current.forEach((pc) => pc.close());
        pcsRef.current.clear();
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
        setLocalStream(null);
        setRemotePeers([]);
        setJoined(false);
        setScreenSharing(false);
    }, []);

    const toggleScreenShare = useCallback(async () => {
        if(screenSharing) {
            const camTrack = cameraTrackRef.current;
            if(camTrack){
                pcsRef.current.forEach((pc) => {
                    const sender = pc.getSenders().find((s) => s.track?.kind === "video");
                    sender?.replaceTrack(camTrack);
                });
            }
            setScreenSharing(false);
            return;
        }

        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        pcsRef.current.forEach((pc) => {
            const sender = pc.getSenders().find((s) => s.track?.kind === "video");
            sender?.replaceTrack(screenTrack);
        });
        screenTrack.onended = () => toggleScreenShare();
        setScreenSharing(true);
    }, [screenSharing]);

    useEffect(() => () => leave(), [leave]);

    return { localStream, remotePeers, joined, screenSharing, join, leave, toggleScreenShare };
}