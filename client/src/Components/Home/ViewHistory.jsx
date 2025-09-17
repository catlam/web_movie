import React, { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getContinueWatchingAction } from "../../Redux/Actions/watchActions";
import Titles from "../Titles";
import Movie from "../Movie";
import Loader from "../Notifications/Loader";
import { FaHistory } from "react-icons/fa";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

// map playback_state -> shape Movie.jsx
function useAdaptMovies(playbackList) {
    return useMemo(() => {
        return (playbackList || []).map((p) => ({
            _id: p.movieId,                          // Movie id
            name: p.title || "Untitled",             // Movie.jsx dùng name
            titleImage: p.posterPath || p.image,     // poster
            image: p.backdropPath || p.posterPath,   // backdrop
            year: p.releaseDate ? Number(p.releaseDate) : undefined,
            isPremium: p.isPremium,
            _progressPct: p.progressPct,             // dùng nếu muốn vẽ progress
            _resumeSeconds: p.lastPosition,
            _duration: p.duration,
        }));
    }, [playbackList]);
}

export default function ViewHistory() {
    const dispatch = useDispatch();
    const { loading, items, error } = useSelector((s) => s.continueWatching);
    const movies = useAdaptMovies(items);
    

    useEffect(() => {
        dispatch(getContinueWatchingAction());
    }, [dispatch]);

    const prevRef = useRef(null);
    const nextRef = useRef(null);

    return (
        <div className="my-16 relative">
            {loading ? (
                <Loader />
            ) : error ? (
                <div className="mt-4 text-red-400 text-sm">{String(error)}</div>
            ) : movies.length > 0 ? (
                <>
                    <Titles title="View History" Icon={FaHistory} />
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
                                    <div className="relative">
                                        <Movie movie={movie} />
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
                </>
            ) : null}
        </div>
    );

}
