import React, { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    getContinueWatchingAction,
    deletePlaybackAction,
    clearAllPlaybackAction,
} from "../../Redux/Actions/watchActions";
import { listSeriesAction } from "../../Redux/Actions/seriesActions";
import Titles from "../Titles";
import Loader from "../Notifications/Loader";
import { FaHistory } from "react-icons/fa";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import PosterCard from "../PosterCard";
import { listSeasonsBySeriesService } from "../../Redux/APIs/seriesServices";
import { listEpisodesBySeasonService } from "../../Redux/APIs/seasonServices";
import { getSeriesHistoryService } from "../../Redux/APIs/watchAPI";
import { getEpisodeBySeriesSEService } from "../../Redux/APIs/episodeServices";

if (typeof window !== "undefined") {
    window.__CW_DEBUG__ = true;
}

function adaptPlayback(p) {
    return {
        _id: p.movieId,
        name: p.title || "Untitled",
        titleImage: p.posterPath || p.image,
        image: p.backdropPath || p.posterPath,
        year: p.releaseDate ? Number(p.releaseDate) : undefined,
        isPremium: p.isPremium,
        _progressPct: p.progressPct,
        _resumeSeconds: p.lastPosition,
        _duration: p.duration,
        _season: p.seasonNumber ?? null,
        _episode: p.episodeNumber ?? null,
        _episodeId: p.episodeId ?? null,
        _isSeriesFromPayload: p.seasonNumber != null && p.episodeNumber != null,
        _lastActionAt: p.lastActionAt ? new Date(p.lastActionAt).getTime() : 0,
    };
}

export default function ViewHistory() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo } = useSelector((s) => s.userLogin);
    const { loading, items, error } = useSelector((s) => s.continueWatching);
    const { items: seriesItems = [] } = useSelector((s) => s.seriesList || {});
    const seriesIdSet = useMemo(
        () => new Set((seriesItems || []).map((x) => String(x._id))),
        [seriesItems]
    );
    const deleting = useSelector((s) => s.deletePlayback?.loading);
    const clearing = useSelector((s) => s.clearAllPlayback?.loading);

    useEffect(() => {
        if (userInfo?.token) {
            dispatch(getContinueWatchingAction());
            dispatch(listSeriesAction({ limit: 200 }));
        }
    }, [dispatch, userInfo]);

    const list = useMemo(() => {
        if (!items?.length) return [];
        const series = [];
        const movies = [];
        for (const p of items) {
            if (p.seasonNumber != null && p.episodeNumber != null) series.push(p);
            else movies.push(p);
        }
        const latestSeriesMap = new Map();
        for (const p of series) {
            const key = String(p.movieId);
            const cur = latestSeriesMap.get(key);
            const curTs = cur?.lastActionAt ? new Date(cur.lastActionAt).getTime() : -1;
            const meTs = p.lastActionAt ? new Date(p.lastActionAt).getTime() : -1;
            if (!cur || meTs > curTs) latestSeriesMap.set(key, p);
        }
        const latestSeries = Array.from(latestSeriesMap.values()).map(adaptPlayback);
        const seriesIds = new Set(latestSeries.map((x) => String(x._id)));
        const onlyMovies = movies
            .filter((p) => !seriesIds.has(String(p.movieId)))
            .map(adaptPlayback);
        const merged = [...latestSeries, ...onlyMovies].sort(
            (a, b) => b._lastActionAt - a._lastActionAt
        );
        if (window.__CW_DEBUG__) {
            const debugRows = merged.map((r) => ({
                _id: r._id,
                name: r.name,
                _isSeriesFromPayload: r._isSeriesFromPayload,
                _season: r._season,
                _episode: r._episode,
                _episodeId: r._episodeId,
                progress: r._progressPct,
                lastActionAt: new Date(r._lastActionAt).toLocaleString(),
            }));
            // console.groupCollapsed(
            //     "%c[CW] ContinueWatching merged items",
            //     "color:#10b981;font-weight:bold"
            // );
            // console.table(debugRows);
            // console.groupEnd();
        }
        return merged;
    }, [items]);

    // useEffect(() => {
    //     if (window.__CW_DEBUG__) {
    //         console.groupCollapsed(
    //             "%c[CW] seriesList items (for fallback detect)",
    //             "color:#3b82f6;font-weight:bold"
    //         );
    //         console.log("count:", seriesItems?.length || 0);
    //         console.log("sample ids:", (seriesItems || []).slice(0, 5).map((x) => x._id));
    //         console.groupEnd();
    //     }
    // }, [seriesItems]);

    const prevRef = useRef(null);
    const nextRef = useRef(null);

    if (!userInfo?.token) return null;

    const safeError =
        error && !/not authorized|no token/i.test(String(error)) ? String(error) : null;

    const resolveEpisodeIdBySE = async (seriesId, seasonNumber, episodeNumber) => {
        try {
            const res = await getEpisodeBySeriesSEService(seriesId, seasonNumber, episodeNumber);
            return res?._id || null;
        } catch (err) {
            if (window.__CW_DEBUG__) {
                console.warn("[CW] resolveEpisodeIdBySE error:", err?.response?.data || err?.message || err);
            }
            return null;
        }
    };

    const resolveEpisodeIdFromHistory = async (seriesId) => {
        try {
            const rows = await getSeriesHistoryService(seriesId);
            const withEp = (rows || [])
                .filter((x) => x.episodeId && x.lastActionAt && x.lastPosition > 0)
                .sort(
                    (a, b) =>
                        new Date(b.lastActionAt || 0).getTime() -
                        new Date(a.lastActionAt || 0).getTime()
                );
            if (window.__CW_DEBUG__) {
                console.log("[CW] history rows:", rows?.length || 0, "with episodeId:", withEp.length);
                console.log("[CW] filtered entries:", withEp.map(r => ({
                    episodeId: r.episodeId,
                    seasonNumber: r.seasonNumber,
                    episodeNumber: r.episodeNumber,
                    lastPosition: r.lastPosition,
                    lastActionAt: r.lastActionAt,
                })));
            }
            if (!withEp.length) return null;
            const latest = withEp[0];
            if (window.__CW_DEBUG__) {
                console.log("[CW] selected history entry:", {
                    episodeId: latest.episodeId,
                    seasonNumber: latest.seasonNumber,
                    episodeNumber: latest.episodeNumber,
                    lastPosition: latest.lastPosition,
                    lastActionAt: latest.lastActionAt,
                });
            }
            return latest.episodeId || null;
        } catch (err) {
            if (window.__CW_DEBUG__) {
                console.warn("[CW] resolveEpisodeIdFromHistory error:", err?.response?.data || err?.message || err);
            }
            return null;
        }
    };

    const onOpen = async (m) => {
        const isSeries = !!m._isSeriesFromPayload || seriesIdSet.has(String(m._id));

        if (window.__CW_DEBUG__) {
            console.group(
                "%c[CW] onOpen",
                "color:#f59e0b;font-weight:bold"
            );
            console.log("item:", {
                _id: m._id,
                name: m.name,
                isSeries,
                _isSeriesFromPayload: m._isSeriesFromPayload,
                _season: m._season,
                _episode: m._episode,
                _episodeId: m._episodeId,
                resume: m._resumeSeconds,
            });
        }

        if (!isSeries) {
            // ✅ Sửa: Navigate đến /watch/:movieId cho movie, truyền resumeSeconds
            const to = `/watch/${m._id}`;
            if (window.__CW_DEBUG__) console.log("→ navigate movie:", to, "with resume:", m._resumeSeconds ?? 0);
            navigate(to, { state: { resumeSeconds: m._resumeSeconds ?? 0 } });
            if (window.__CW_DEBUG__) console.groupEnd();
            return;
        }

        // Phần series giữ nguyên như trước...
        // 1) Có sẵn episodeId trong payload?
        if (m._episodeId) {
            const to = `/watch/episode/${m._episodeId}`;
            if (window.__CW_DEBUG__) console.log("→ navigate by payload episodeId:", to);
            navigate(to, { state: { resumeSeconds: m._resumeSeconds ?? 0 } });
            if (window.__CW_DEBUG__) console.groupEnd();
            return;
        }

        // 2) Thử map từ episode nếu payload có _episode
        if (m._episode != null) {
            try {
                // Lấy danh sách seasons để tìm seasonNumber hợp lệ
                const seasons = await listSeasonsBySeriesService(m._id);
                if (seasons?.length) {
                    // Ưu tiên seasonNumber từ payload, nếu không thì lấy season đầu tiên
                    const seasonNumber = m._season ?? seasons[0].seasonNumber;
                    const eid = await resolveEpisodeIdBySE(m._id, seasonNumber, m._episode);
                    if (eid) {
                        const to = `/watch/episode/${eid}`;
                        if (window.__CW_DEBUG__) console.log("→ navigate by S/E mapping:", to);
                        navigate(to, { state: { resumeSeconds: m._resumeSeconds ?? 0 } });
                        if (window.__CW_DEBUG__) console.groupEnd();
                        return;
                    } else if (window.__CW_DEBUG__) {
                        console.log("S/E mapping failed — no episodeId found for", { seasonNumber, episodeNumber: m._episode });
                    }
                }
            } catch (err) {
                if (window.__CW_DEBUG__) {
                    console.warn("[CW] resolveEpisodeIdBySE error:", err?.response?.data || err?.message || err);
                }
            }
        }

        // 3) Lấy từ lịch sử
        const fromHistory = await resolveEpisodeIdFromHistory(m._id);
        if (fromHistory) {
            const to = `/watch/episode/${fromHistory}`;
            if (window.__CW_DEBUG__) console.log("→ navigate by history:", to);
            navigate(to, { state: { resumeSeconds: m._resumeSeconds ?? 0 } });
            if (window.__CW_DEBUG__) console.groupEnd();
            return;
        }

        // 4) Fallback: Lấy episode đầu tiên của season đầu tiên
        try {
            const seasons = await listSeasonsBySeriesService(m._id);
            if (seasons?.length) {
                const firstSeason = seasons.sort((a, b) => a.seasonNumber - b.seasonNumber)[0];
                const episodes = await listEpisodesBySeasonService(firstSeason._id);
                if (episodes?.length) {
                    const firstEpisode = episodes.sort((a, b) => a.episodeNumber - b.episodeNumber)[0];
                    const to = `/watch/episode/${firstEpisode._id}`;
                    if (window.__CW_DEBUG__) console.log("→ navigate to first episode:", to);
                    navigate(to, { state: { resumeSeconds: m._resumeSeconds ?? 0 } });
                    if (window.__CW_DEBUG__) console.groupEnd();
                    return;
                }
            }
        } catch (err) {
            if (window.__CW_DEBUG__) {
                console.warn("[CW] fetch first episode error:", err?.response?.data || err?.message || err);
            }
        }

        const fallback = `/series/${m._id}`;
        if (window.__CW_DEBUG__) console.log("→ fallback:", fallback);
        navigate(fallback, { state: { resumeSeconds: m._resumeSeconds ?? 0 } });
        if (window.__CW_DEBUG__) console.groupEnd();
    };

    const onDelete = (m) => {
        if (deleting) return;
        dispatch(
            deletePlaybackAction({
                movieId: m._id,
                seasonNumber: m._isSeriesFromPayload ? m._season : null,
                episodeNumber: m._isSeriesFromPayload ? m._episode : null,
            })
        )
            .then(() => toast.success("Removed from Continue Watching"))
            .catch(() => toast.error("Failed to remove"));
    };

    const onClearAll = () => {
        if (clearing) return;
        dispatch(clearAllPlaybackAction())
            .then(() => toast.success("Viewing history cleared"))
            .catch(() => toast.error("Failed to clear history"));
    };

    return (
        <div className="my-16 relative">
            {loading ? (
                <Loader />
            ) : safeError ? (
                <div className="mt-4 text-red-400 text-sm">{safeError}</div>
            ) : list.length > 0 ? (
                <>
                    <div className="flex items-center justify-between">
                        <Titles title="Continue Watching" Icon={FaHistory} />
                        <button
                            onClick={onClearAll}
                            disabled={clearing}
                            className={`text-xs md:text-sm px-3 py-1 rounded border ${clearing
                                ? "opacity-60 cursor-not-allowed border-gray-500 text-gray-300"
                                : "border-white/40 text-white hover:bg-white hover:text-black transition"
                                }`}
                            title="Clear all viewing history"
                        >
                            {clearing ? "Clearing..." : "Clear all"}
                        </button>
                    </div>
                    <div className="mt-6 relative">
                        <Swiper
                            modules={[Navigation]}
                            spaceBetween={20}
                            slidesPerView={4}
                            onInit={(swiper) => {
                                swiper.params.navigation.prevEl = prevRef.current;
                                swiper.params.navigation.nextEl = nextRef.current;
                                swiper.navigation.init();
                                swiper.navigation.update();
                            }}
                            breakpoints={{
                                320: { slidesPerView: 1 },
                                640: { slidesPerView: 2 },
                                1024: { slidesPerView: 3 },
                                1280: { slidesPerView: 4 },
                            }}
                        >
                            {list.map((m, idx) => {
                                const key = `${m._id}-${m._season ?? "M"}-${m._episode ?? "0"}-${idx}`;
                                const isSeries = m._isSeriesFromPayload || seriesIdSet.has(String(m._id));
                                return (
                                    <SwiperSlide key={key}>
                                        <PosterCard
                                            image={m.image || m.titleImage}
                                            title={m.name}
                                            subtitle={isSeries ? `S${m._season ?? "?"} • Ep${m._episode ?? "?"}` : undefined}
                                            progressPct={typeof m._progressPct === "number" ? m._progressPct : null}
                                            onOpen={() => onOpen(m)}
                                            onDelete={() => onDelete(m)}
                                            deleting={!!deleting}
                                        />
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>
                        <button
                            ref={prevRef}
                            className="absolute top-1/2 -left-6 z-10 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full shadow-lg transition duration-300 w-10 h-10 flex items-center justify-center"
                        >
                            ◀
                        </button>
                        <button
                            ref={nextRef}
                            className="absolute top-1/2 -right-6 z-10 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full shadow-lg transition duration-300 w-10 h-10 flex items-center justify-center"
                        >
                            ▶
                        </button>
                    </div>
                </>
            ) : null}
        </div>
    );
}