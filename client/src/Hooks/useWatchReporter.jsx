import { useEffect, useRef, useCallback } from "react";
import { upsertWatchService } from "../Redux/APIs/watchAPI";

export default function useWatchReporter({ movieId, videoRef, pingInterval = 10 }) {
    const sentStartRef = useRef(false);
    const lastSentPosRef = useRef(0);
    const lastPingAtRef = useRef(0);
    const timerRef = useRef(null);

    const send = useCallback(async (event, position, duration, inc) => {
        try {
            await upsertWatchService({
                movieId,
                event,
                position,
                duration,
                playedSeconds: inc,
            });
        } catch (err) {
            console.error("watch reporter send error", err);
        }
    }, [movieId]);

    const stop = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
    };

    const start = useCallback(() => {
        stop();
        timerRef.current = setInterval(async () => {
            const v = videoRef.current;
            if (!v || v.paused || v.seeking || v.readyState < 1) return;
            const now = Date.now();
            const pos = v.currentTime || 0;
            const dur = v.duration || 0;
            const inc = pos - lastSentPosRef.current;
            const since = (now - lastPingAtRef.current) / 1000;
            if (since >= pingInterval && inc > 0.5) {
                lastSentPosRef.current = pos;
                lastPingAtRef.current = now;
                await send("progress", pos, dur, inc);
            }
        }, 1000);
    }, [videoRef, pingInterval, send]); // dependencies


    const onPlay = async () => {
        const v = videoRef.current;
        if (!v) return;
        if (!sentStartRef.current) {
            sentStartRef.current = true;
            lastSentPosRef.current = v.currentTime || 0;
            lastPingAtRef.current = Date.now();
            await send("start", v.currentTime || 0, v.duration || 0, 0);
        }
        start();
    };

    const onPause = async () => {
        const v = videoRef.current;
        if (!v) return;
        stop();
        const pos = v.currentTime || 0;
        const dur = v.duration || 0;
        const inc = Math.max(0, pos - lastSentPosRef.current);
        lastSentPosRef.current = pos;
        lastPingAtRef.current = Date.now();
        await send("progress", pos, dur, inc);
    };

    const onEnded = async () => {
        const v = videoRef.current;
        if (!v) return;
        stop();
        await send("complete", v.duration || v.currentTime || 0, v.duration || 0, 0);
    };

    useEffect(() => () => stop(), []);
    useEffect(() => {
        const h = () => (document.hidden ? stop() : start());
        document.addEventListener("visibilitychange", h);
        return () => document.removeEventListener("visibilitychange", h);
    }, [start]);


    return { onPlay, onPause, onEnded };
}
