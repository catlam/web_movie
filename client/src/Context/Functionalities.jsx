import toast from "react-hot-toast";
import {useSelector} from "react-redux"
import { likeMovieAction } from "../Redux/Actions/userActions";

// check if movie is add to favorites
const IfMovieLiked = (movie) =>{
    const { likedMovies } = useSelector(state => state.userGetFavoriteMovies)
    return likedMovies?.find(likedMovies => likedMovies?._id === movie?._id)
}

// like movie functionality
const LikeMovie = (movie, dispatch, userInfo) => {
    return !userInfo
    ? toast.error("Please sign in to add to favorites")
    : dispatch(
        likeMovieAction({
            movieId: movie._id,
        })
    )
}

export {IfMovieLiked, LikeMovie}