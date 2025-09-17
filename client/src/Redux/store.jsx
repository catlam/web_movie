import {combineReducers,configureStore} from '@reduxjs/toolkit';
import * as User from './Reducers/userReducers';
import * as categories from './Reducers/categoriesReducers'
import * as movies from "./Reducers/moviesReducers"; 
import { continueWatchingReducer } from './Reducers/watchReducers';

const rootReducer = combineReducers({
    // user reducers
    userLogin: User.userLoginReducer,
    userRegister: User.userRegisterReducer,
    userUpdateProfile: User.userUpdateProfileReducer, 
    userDeleteProfile: User.userDeleteProfileReducer,
    userchangepassword: User.userChangePasswordReducer,
    userGetFavoriteMovies: User.userGetFavoriteMoviesReducer,
    userDeleteFavoriteMovies: User.userDeleteFavoriteMovieReducer,
    adminGetAllUsers: User.adminGetAllUsersReducer,
    adminDeleteUser: User.adminDeleteUserReducer,
    userLikeMovie: User.userLikeMovieReducer,
    userDeleteMovieById: User.userDeleteFavoriteMovieByIdReducer,


    // Category reducers
    categoryGetAll: categories.getAllCategoriesReducer,
    categoryCreate: categories.createCategoryReducer,
    categoryUpdate: categories.updateCategoryReducer,
    categoryDelete: categories.deleteCategoryReducer,

    // Movies reducers
    getAllMovies: movies.moviesListReducer,
    getRandomMovies: movies.moviesRandomReducer,
    getMovieById: movies.movieDetailsReducer,
    getTopRatedMovie: movies.movieTopRatedReducer,
    createReview: movies.createReviewReducer, 
    deleteMovie: movies.deleteMovieReducer,
    deleteAllMovies: movies.deleteAllMoviesReducer,
    createMovie : movies.createMovieReducer,
    casts: movies.CastsReducer,
    updateMovie: movies.updateMovieReducer,
    deleteReview: movies.deleteReviewReducer,

    // watch history
    continueWatching: continueWatchingReducer,
})

// get userInfo form localStorage
const userInfoFromLocalStorage = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null; 

// initialState
const initialState = {
    userLogin: {userInfo: userInfoFromLocalStorage},
};

export const store = configureStore({
    reducer: rootReducer,
    preloadedState: initialState, 
})