import React, { useEffect, useRef, useState } from 'react';
import Layout from '../Layout/Layout';
import { Link, useParams } from 'react-router-dom';
import { BiArrowBack } from 'react-icons/bi';
import { FaCloudDownloadAlt, FaHeart, FaPlay } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { getMovieByIdAction } from '../Redux/Actions/MoviesActions';
import Loader from '../Components/Notifications/Loader';
import { RiMovie2Line } from 'react-icons/ri';
import { IfMovieLiked, LikeMovie } from '../Context/Functionalities';
import { getPlaybackStateService } from '../Redux/APIs/watchAPI';
import useWatchReporter from '../Hooks/useWatchReporter';

function WatchPage() {
    let { id } = useParams();
    const dispatch = useDispatch();
    const [play, setPlay] = useState(false);
    const videoRef = useRef(null);

    const seekedOnceRef = useRef(false);

    const sameClass = "w-full gap-6 flex-colo min-h-screen"

    const { isLoading, isError, movie } = useSelector((state) => state.getMovieById);
    const { isLoading: likeLoading } = useSelector((state) => state.userLikeMovie);
    const { userInfo } = useSelector((state) => state.userLogin);

    const { onPlay, onPause, onEnded } = useWatchReporter({ movieId: id, videoRef, pingInterval: 10 });

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
        }
    };

    const [resumeTime, setResumeTime] = useState(0);

    const isLiked = (movie) => IfMovieLiked(movie);

    useEffect(() => {
        if (!id || !userInfo?.token) return;
        getPlaybackStateService(userInfo.token, { movieId: id })
            .then((st) => {
                if (st?.lastPosition > 0) setResumeTime(Number(st.lastPosition));
            })
            .catch(() => { });
    }, [id, userInfo]);

    useEffect(() => {
        dispatch(getMovieByIdAction(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (!play || !resumeTime) return;
        const v = videoRef.current;
        if (!v) return;
        const jump = () => {
            try { v.currentTime = resumeTime; } catch { }
        };
        if (v.readyState >= 1) jump();
        else v.addEventListener('loadedmetadata', jump, { once: true });
    }, [play, resumeTime]);

    return (
        <Layout>
            <div className="container mx-auto bg-dry p-6 mb-12">
                {!isError && (
                    <div className="flex-btn flex-wrap mb-6 gap-2 bg-main rounded border-gray-800 p-6">
                        <Link
                            to={`/movie/${movie?._id}`}
                            className="md:text-xl text-sm flex gap-3 items-center font-bold text-dryGray"
                        >
                            <BiArrowBack />{movie?.name}
                        </Link>
                        <div className="flex-btn sm:w-auto w-full gap-5">
                            <button
                                onClick={() => LikeMovie(movie, dispatch, userInfo)}
                                disabled={isLiked(movie) || likeLoading}
                                className={`bg-white hover:text-subMain 
                  ${isLiked(movie) ? 'text-subMain' : 'text-white'}
                  transition bg-opacity-30 rounded px-4 py-3 text-sm`}
                            >
                                <FaHeart />
                            </button>
                            <button className="bg-subMain flex-rows gap-2 hover:text-main transition text-white rounded px-8 font-medium py-3 text-sm ">
                                <FaCloudDownloadAlt /> Download
                            </button>
                        </div>
                    </div>
                )}

                {/* watch video */}
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
                        <source src={movie?.video} type="video/mp4" />
                    </video>
                ) : (
                    <div className="w-full h-screen rounded-lg overflow-hidden relative">
                        {isLoading ? (
                            <div className={sameClass}><Loader /></div>
                        ) : isError ? (
                            <div className={sameClass}>
                                <div className="flex-colo w-24 h-24 p-5 mb-4 rounded-full bg-dry text-subMain text-4xl">
                                    <RiMovie2Line />
                                </div>
                                <p className="text-border text-sm">{isError}</p>
                            </div>
                        ) : (
                            <>
                                <div className="absolute top-0 left-0 bottom-0 right-0 bg-main bg-opacity-30 flex-colo">
                                    <button
                                        onClick={() => setPlay(true)}
                                        className="bg-white text-subMain flex-colo border border-subMain rounded-full w-20 h-20 font-medium text-xl"
                                    >
                                        <FaPlay />
                                    </button>
                                </div>
                                <img
                                    src={movie?.image ? movie?.image : movie?.titleImage}
                                    alt={movie?.name}
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

export default WatchPage;