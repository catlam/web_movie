import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { IfMovieLiked, LikeMovie } from '../Context/Functionalities';

function SeriesCard({ series }) {
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.userLikeMovie);
    const { userInfo } = useSelector((state) => state.userLogin);

    const isLiked = IfMovieLiked(series);

    return (
        <div className="border border-border p-1 hover:scale-95 transitions relative rounded overflow-hidden">
            <Link to={`/series/${series?._id}`} className="w-full">
                <img
                    src={series?.image ? series?.image : (series?.titleImage || '/images/user.png')}
                    alt={series?.name || series?.title}
                    className="w-full h-96 object-cover"
                    loading="lazy"
                    decoding="async"
                />
            </Link>

            {/* Tên series + nút tim */}
            <div className="absolute flex-btn gap-2 bottom-0 right-0 left-0 bg-main bg-opacity-60 text-white px-4 py-3">
                <h3 className="font-semibold truncate">
                    {series?.name || series?.title || 'Untitled'}
                </h3>
                <button
                    onClick={() => LikeMovie(series, dispatch, userInfo)}
                    disabled={isLiked || isLoading}
                    className={`h-9 w-9 text-sm flex-colo transition 
            ${isLiked ? 'bg-transparent' : 'bg-subMain'}
            hover:bg-transparent border-2 border-subMain rounded-md text-white`}
                    aria-label="Like series"
                    title={isLiked ? 'Liked' : 'Like'}
                >
                    <FaHeart />
                </button>
            </div>
        </div>
    );
}

export default SeriesCard;
