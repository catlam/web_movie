import toast from "react-hot-toast";
import { likeMovieAction, deleteFavoriteMovieByIdAction } from "../Redux/Actions/userActions";

/** Chuẩn hoá danh sách favorites từ nhiều shape khác nhau của Redux slice */
const normalizeFavorites = (src) => {
    // src có thể là: mảng trực tiếp, hoặc object { favorites }, { likedMovies }, { items }
    if (Array.isArray(src)) return src;
    if (src && Array.isArray(src.favorites)) return src.favorites;
    if (src && Array.isArray(src.likedMovies)) return src.likedMovies;
    if (src && Array.isArray(src.items)) return src.items;
    return [];
};

/** Kiểm tra đã like chưa (chịu lỗi tốt nếu truyền nhầm tham số) */
export const IfMovieLiked = (favoritesMaybe, itemMaybe) => {
    // Hỗ trợ cả cách gọi cũ: IfMovieLiked(movie) => luôn false
    if (!itemMaybe || !itemMaybe?._id) return false;

    const favorites = normalizeFavorites(favoritesMaybe);
    if (!Array.isArray(favorites) || favorites.length === 0) return false;

    const kind = itemMaybe.__kind === "series" ? "series" : "movie"; // mặc định "movie" nếu thiếu
    return favorites.some((f) => f?._id === itemMaybe._id && (f?.__kind || "movie") === kind);
};

/** Toggle like/unlike (hợp nhất movie/series) */
export const LikeMovie = (item, dispatch, userInfo, favoritesMaybe) => {
    if (!userInfo?._id) {
        return toast.error("Please sign in to add to favorites");
    }

    const favorites = normalizeFavorites(favoritesMaybe);
    const kind = item.__kind === "series" ? "Series" : "Movie"; // server đang nhận "Series"/"Movie"
    const liked = IfMovieLiked(favorites, item);

    if (liked) {
        dispatch(deleteFavoriteMovieByIdAction({ id: item._id, kind }));
    } else {
        dispatch(likeMovieAction({ id: item._id, kind }));
    }
};
