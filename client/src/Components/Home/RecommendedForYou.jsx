// src/Components/Home/RecommendedForYou.jsx
import React, { useEffect, useMemo, useState } from "react";
import Titles from "../Titles";
import { BsCollectionFill } from "react-icons/bs";
import { TbPlayerTrackNext, TbPlayerTrackPrev } from "react-icons/tb";
import Movie from "../Movie";
import SeriesCard from "../SeriesCard";
import { Empty } from "../Notifications/empty";
import Loader from "../Notifications/Loader";
import { AnimatePresence, motion } from "framer-motion";
import AxiosReco from "../../Redux/APIs/AxiosReco";
import { useSelector } from "react-redux";

function readUserId() {
    try {
        const raw = localStorage.getItem("userInfo");
        if (!raw) return null;
        const u = JSON.parse(raw);
        return u?._id || u?.id || u?.userId || null;
    } catch {
        return null;
    }
}

function normalizeReco(it) {
    const kind = it.kind === "series" ? "series" : "movie";
    const cats = Array.isArray(it.category)
        ? it.category
        : it.category
            ? [it.category]
            : [];
    return {
        _id: it.movieId,
        kind,
        title: it.title || it.name || "Untitled",
        image: it.posterUrl || it.image || it.titleImage || "",
        posterUrl: it.posterUrl || "",
        titleImage: it.titleImage || "",
        year: it.year,
        rate: typeof it.rate === "number" ? it.rate : undefined,
        category: cats[0] || (kind === "series" ? "SERIES" : "MOVIE"),
        genres: cats.map((x) => String(x || "")),
    };
}

function rerankByRecentGenres(cards, recentGenres = []) {
    if (!recentGenres.length) return cards;
    const pref = new Set(recentGenres.map((g) => (g || "").toLowerCase().trim()));
    return [...cards]
        .map((c) => {
            const gs = (c.genres || []).map((x) => (x || "").toLowerCase().trim());
            let overlap = 0;
            gs.forEach((g) => {
                if (g && pref.has(g)) overlap += 1;
            });
            return { c, boost: overlap * 10 }; // tuỳ biến hệ số
        })
        .sort((a, b) => b.boost - a.boost)
        .map((x) => x.c);
}

export default function RecommendedForYou({
    pageSize = 8,
    limit = 24,
    titleWhenPersonalized = "Recommended for you",
    titleWhenCold = "Trending for you",
    className = "",
    userId: userIdProp,
    hideWhenNoUser = true,
    hideWhenColdStart = true,
    hideWhenEmpty = true,
}) {
    const [items, setItems] = useState([]);
    const [cold, setCold] = useState(false);
    const [loading, setLoading] = useState(false);

    const favState = useSelector((s) => s.userGetFavoriteMovies || {});
    const favorites = Array.isArray(favState.favorites)
        ? favState.favorites
        : Array.isArray(favState.likedMovies)
            ? favState.likedMovies
            : [];

            
    const historyState = useSelector((s) => s.userWatchHistory || {});
    const recentHistory = Array.isArray(historyState.items) ? historyState.items : [];
    

    const recentGenres = useMemo(() => {
        const arr = [];
        for (const h of recentHistory.slice(0, 10)) {
            if (Array.isArray(h.category)) {
                for (const c of h.category) if (c) arr.push(String(c));
            } else if (h.category) {
                arr.push(String(h.category));
            }
            // nếu schema cũ có h.genres
            if (Array.isArray(h.genres)) {
                for (const g of h.genres) if (g) arr.push(String(g));
            }
        }
        return arr;
    }, [recentHistory]);

    // Pagination
    const [page, setPage] = useState(1);
    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(items.length / pageSize)),
        [items.length, pageSize]
    );
    const start = (page - 1) * pageSize;
    const current = items.slice(start, start + pageSize);

    const userId = userIdProp || readUserId();

    // Fetch data — luôn gọi hook trước (tuân thủ rules-of-hooks)
    useEffect(() => {
        let mounted = true;

        // nếu không có userId, clear state và dừng (hook vẫn được gọi)
        if (!userId) {
            setItems([]);
            setCold(false);
            return () => { };
        }

        (async () => {
            setLoading(true);
            try {
                const res = await AxiosReco.get(`/recommend/user/${userId}`, {
                    params: { n: limit },
                });
                if (!mounted) return;

                const data = res?.data || {};
                const list = Array.isArray(data.items) ? data.items : [];
                const normalized = list.map(normalizeReco);
                const ranked = rerankByRecentGenres(normalized, recentGenres);

                setItems(ranked);
                setCold(!!(data.cold_start || data.fallback));
                setPage(1);
            } catch (e) {
                if (mounted) {
                    setItems([]);
                    setCold(false);
                }
                console.warn("[RecommendedForYou] fetch error:", e?.message || e);
            } finally {
                mounted && setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [userId, limit, recentGenres.join("|"), favorites.length]);

    // (tuỳ chọn) lắng nghe event custom nếu bạn bắn ở nơi khác
    useEffect(() => {
        const onFav = () => setPage(1);
        window.addEventListener("favorites-changed", onFav);
        return () => window.removeEventListener("favorites-changed", onFav);
    }, []);

    // === Guard hiển thị (đặt SAU khi gọi hooks) ===
    const shouldHide =
        (hideWhenNoUser && !userId) ||
        (hideWhenColdStart && !loading && cold) ||
        (hideWhenEmpty && !loading && items.length === 0);

    if (shouldHide) return null;

    const sameBtn =
        "text-white py-2 px-4 rounded font-semibold border-2 border-subMain hover:bg-subMain disabled:opacity-40 disabled:cursor-not-allowed";
    const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));
    const prevPage = () => setPage((p) => Math.max(p - 1, 1));

    const variants = {
        enter: { opacity: 0, y: 20 },
        center: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };
    const sectionTitle = cold ? titleWhenCold : titleWhenPersonalized;

    return (
        <div className={`my-16 relative ${className}`}>
            <Titles title={sectionTitle} Icon={BsCollectionFill} />

            {loading ? (
                <Loader />
            ) : items.length > 0 ? (
                <>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={page}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.25 }}
                            className="grid sm:mt-12 mt-6 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-10"
                        >
                            {current.map((card, idx) =>
                                card.kind === "series" ? (
                                    <SeriesCard
                                        key={card._id || idx}
                                        series={{
                                            _id: card._id,
                                            name: card.title,
                                            title: card.title,
                                            image: card.image || card.posterUrl || card.titleImage,
                                            titleImage: card.titleImage,
                                            rate: card.rate,
                                            genres: card.genres,
                                            category: card.category || "SERIES",
                                        }}
                                    />
                                ) : (
                                    <Movie
                                        key={card._id || idx}
                                        movie={{
                                            _id: card._id,
                                            name: card.title,
                                            title: card.title,
                                            image: card.image || card.posterUrl,
                                            rate: card.rate,
                                            year: card.year,
                                            category: card.category || "MOVIE",
                                        }}
                                    />
                                )
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-6 mt-10">
                            <button onClick={prevPage} disabled={page === 1} className={sameBtn}>
                                <TbPlayerTrackPrev className="text-xl" />
                            </button>
                            <span className="text-white text-sm">
                                Page <b>{page}</b> / {totalPages}
                            </span>
                            <button
                                onClick={nextPage}
                                disabled={page === totalPages}
                                className={sameBtn}
                            >
                                <TbPlayerTrackNext className="text-xl" />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="mt-6">
                    <Empty message="It seems like we don’t have any recommendations for you yet." />
                </div>
            )}
        </div>
    );
}
