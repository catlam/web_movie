import React, { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as watchAction from "../../Redux/Actions/watchActions";

import Titles from "../Titles";
import Movie from "../Movie";
import Loader from "../Notifications/Loader";
import { FaHistory } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

// map playback_state -> shape Movie.jsx
function useAdaptMovies(playbackList) {
    return useMemo(() => {
        return (playbackList || []).map((p) => ({
            _id: p.movieId,                          // Movie id (chính là movieId từ server)
            name: p.title || "Untitled",
            titleImage: p.posterPath || p.image,
            image: p.backdropPath || p.posterPath,
            year: p.releaseDate ? Number(p.releaseDate) : undefined,
            isPremium: p.isPremium,
            _progressPct: p.progressPct,
            _resumeSeconds: p.lastPosition,
            _duration: p.duration,
        }));
    }, [playbackList]);
}

export default function ViewHistory() {
    const dispatch = useDispatch();

    const { loading, items, error } = useSelector((s) => s.continueWatching);
    const { userInfo } = useSelector((s) => s.userLogin);
    const token = userInfo?.token;

    const movies = useAdaptMovies(items);

    useEffect(() => {
        dispatch(watchAction.getContinueWatchingAction(token));
    }, [dispatch, token]);

    const prevRef = useRef(null);
    const nextRef = useRef(null);

    const handleDeleteOne = (e, movieId) => {
        e.preventDefault();
        e.stopPropagation();
        if (!token) return;
        dispatch(watchAction.deleteOnePlaybackAction(token, movieId));
    };

    const handleClearAll = () => {
        if (!token) return;
        dispatch(watchAction.clearAllPlaybackAction(token));
    };

    if (loading) {
        return (
            <div className="my-16">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-16 mt-4 text-red-400 text-sm">{String(error)}</div>
        );
    }

    if (movies.length === 0) {
        return null; // Không render gì khi chưa có lịch sử
    }

    return (
        <div className="my-16 relative">
            {/* Header: Title + Clear all */}
            <div className="flex items-center justify-between">
                <Titles title="View History" Icon={FaHistory} />
                <button
                    onClick={handleClearAll}
                    className="text-sm px-4 py-2 rounded bg-dry hover:bg-subMain 
                    text-white transition whitespace-nowrap"
                >
                    Clear all
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
                    {movies.map((movie, index) => (
                        <SwiperSlide key={`${movie._id}-${index}`}>
                            <div className="relative group">
                                {/* Nút X xoá từng mục (góc trên phải) */}
                                <button
                                    title="Remove from history"
                                    onClick={(e) => handleDeleteOne(e, movie._id)}
                                    className="absolute z-10 top-2 right-2 p-1.5 rounded-full
                             bg-black/60 hover:bg-black/90 text-white
                             opacity-90 group-hover:opacity-100 transition"
                                >
                                    <RxCross2 size={18} />
                                </button>

                                {/* Card phim */}
                                <Movie movie={movie} />

                                {/* Thanh progress ở đáy card */}
                                {typeof movie._progressPct === "number" && (
                                    <div className="absolute left-0 right-0 bottom-2 px-2">
                                        <div className="h-1 w-full bg-white/20 rounded">
                                            <div
                                                className="h-1 bg-white rounded"
                                                style={{ width: `${Math.min(100, movie._progressPct)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Nút điều hướng Swiper */}
                <button
                    ref={prevRef}
                    className="absolute top-1/2 -left-6 z-10 -translate-y-1/2
                     bg-black/50 hover:bg-black/80
                     text-white p-3 rounded-full shadow-lg
                     transition duration-300 w-10 h-10 flex items-center justify-center"
                >
                    ◀
                </button>
                <button
                    ref={nextRef}
                    className="absolute top-1/2 -right-6 z-10 -translate-y-1/2
                     bg-black/50 hover:bg-black/80
                     text-white p-3 rounded-full shadow-lg
                     transition duration-300 w-10 h-10 flex items-center justify-center"
                >
                    ▶
                </button>
            </div>
        </div>
    );
}
