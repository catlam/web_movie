// src/Pages/WatchSeriesEpisode.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../Layout/Layout";
import { Link, useParams } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import { FaPlay } from "react-icons/fa";
import { RiMovie2Line } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";

import Loader from "../Components/Notifications/Loader";

// ⬇️ Bạn đã có các action/selector này ở phần trước
import { getEpisodeDetailsAction } from "../Redux/Actions/episodeActions";
// ⬇️ API lưu/đọc playback state — giả sử đã hỗ trợ episodeId
import { getPlaybackStateService } from "../Redux/APIs/watchAPI";
// ⬇️ Hook ping thời gian xem như trang movie (nếu của bạn support episodeId)
import useWatchReporter from "../Hooks/useWatchReporter";

function WatchSeriesEpisode() {
    const { episodeId } = useParams(); // route: /watch/:episodeId
    const dispatch = useDispatch();

    const videoRef = useRef(null);
    const [play, setPlay] = useState(false);
    const [resumeTime, setResumeTime] = useState(0);
    const seekedOnceRef = useRef(false);

    const sameClass = "w-full gap-6 flex-colo min-h-screen";

    // Redux states
    const { userInfo } = useSelector((s) => s.userLogin || {});
    const {
        loading: epLoading = false,
        error: epError = null,
        episode = {},
    } = useSelector((s) => s.episodeDetails || {}); // tuỳ tên slice reducer của bạn

    // Ping reporter như trang movie — đảm bảo hook chấp nhận episodeId
    const { onPlay, onPause, onEnded } = useWatchReporter({
        episodeId,
        videoRef,
        pingInterval: 10,
    });

    // Lấy resume time
    useEffect(() => {
        if (!episodeId || !userInfo?.token) return;
        getPlaybackStateService(userInfo.token, { episodeId })
            .then((st) => {
                if (st?.lastPosition > 0) setResumeTime(Number(st.lastPosition));
            })
            .catch(() => { });
    }, [episodeId, userInfo]);

    // Lấy chi tiết episode
    useEffect(() => {
        if (episodeId) dispatch(getEpisodeDetailsAction(episodeId));
    }, [dispatch, episodeId]);

    // Khi bắt đầu play, nếu có resumeTime -> seek
    useEffect(() => {
        if (!play || !resumeTime) return;
        const v = videoRef.current;
        if (!v) return;

        const jump = () => {
            try {
                v.currentTime = resumeTime;
            } catch { }
        };

        if (v.readyState >= 1) jump();
        else v.addEventListener("loadedmetadata", jump, { once: true });
    }, [play, resumeTime]);

    const handleLoadedMetadata = async () => {
        const v = videoRef.current;
        if (!v) return;

        try {
            if (!seekedOnceRef.current && resumeTime > 0) {
                v.currentTime = resumeTime;
                seekedOnceRef.current = true;
            }
            await v.play();
            onPlay();
        } catch (e) {
            // autoplay có thể bị chặn — người dùng sẽ bấm Play lần nữa
        }
    };

    // Tiêu đề hiển thị
    const heading = useMemo(() => {
        if (!episode) return "Episode";
        const epName =
            episode.title ||
            episode.name ||
            (episode.episodeNumber ? `Episode ${episode.episodeNumber}` : "Episode");
        return epName;
    }, [episode]);

    // Link quay lại series
    const backLink = episode?.seriesId ? `/series/${episode.seriesId}` : "/series";

    return (
        <Layout>
            <div className="container mx-auto bg-dry p-6 mb-12">
                {!epError && (
                    <div className="flex-btn flex-wrap mb-6 gap-2 bg-main rounded border-gray-800 p-6">
                        <Link
                            to={backLink}
                            className="md:text-xl text-sm flex gap-3 items-center font-bold text-dryGray"
                            title="Back to series"
                        >
                            <BiArrowBack />
                            {heading}
                        </Link>
                    </div>
                )}

                {/* Player */}
                {play ? (
                    <video
                        ref={videoRef}
                        controls
                        className="w-full h-full rounded"
                        onLoadedMetadata={handleLoadedMetadata}
                        onPlay={onPlay}
                        onPause={onPause}
                        onEnded={onEnded}
                    >
                        <source src={episode?.video} type="video/mp4" />
                    </video>
                ) : (
                    <div className="w-full h-screen rounded-lg overflow-hidden relative">
                        {epLoading ? (
                            <div className={sameClass}>
                                <Loader />
                            </div>
                        ) : epError ? (
                            <div className={sameClass}>
                                <div className="flex-colo w-24 h-24 p-5 mb-4 rounded-full bg-dry text-subMain text-4xl">
                                    <RiMovie2Line />
                                </div>
                                <p className="text-border text-sm">{epError}</p>
                            </div>
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-main bg-opacity-30 flex-colo">
                                    <button
                                        onClick={() => setPlay(true)}
                                        className="bg-white text-subMain flex-colo border border-subMain rounded-full w-20 h-20 font-medium text-xl"
                                        title="Play"
                                    >
                                        <FaPlay />
                                    </button>
                                </div>
                                {/* Poster/Backdrop fallback: nếu episode có thumbnail thì dùng, không thì dùng poster series nếu bạn truyền xuống */}
                                <img
                                    src={
                                        episode?.thumbnail ||
                                        episode?.image ||
                                        episode?.titleImage ||
                                        "/images/banner.png"
                                    }
                                    alt={heading}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default WatchSeriesEpisode;
