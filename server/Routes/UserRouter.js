import express from 'express';
import {
    loginUser,
    registerUser,
    updateUserProfile,
    deleteUserProfile,
    changeUserPassword,
    getLikedMovies,
    addLikedMovie,
    deleteLikedMovies,
    getUsers,
    deleteUser,
    deleteLikedMovieById,
    resetPasswordDirect,
} from '../Controllers/UserController.js';
import { protect, admin } from '../middlewares/Auth.js';

const router = express.Router();

// *********PUBLIC ROUTES******************
router.post("/", registerUser);
router.post('/login', loginUser);
router.post("/reset-password", resetPasswordDirect)


//*********PRIVATE ROUTES****************
router.put("/", protect, updateUserProfile);
router.delete("/", protect, deleteUserProfile);
router.put("/password", protect, changeUserPassword);
router.get("/favorites", protect, getLikedMovies)
router.post("/favorites", protect, addLikedMovie)
router.delete("/favorites", protect, deleteLikedMovies)
router.delete("/favorites/:id", protect, deleteLikedMovieById)

// ***********ADMIN ROUTES********************
router.get("/", protect, admin, getUsers);
router.delete("/:id", protect, admin, deleteUser);


export default router;