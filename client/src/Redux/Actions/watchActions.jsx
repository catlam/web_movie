
import * as watchConstants from "../Constants/watchConstants";
import { clearAllPlaybackService, deleteOnePlaybackService, getContinueWatchingService } from "../APIs/watchService";
import { ErrorsAction } from "../Protection";

export const getContinueWatchingAction = () => async (dispatch) => {
    try {
        dispatch({ type: watchConstants.CONTINUE_WATCHING_REQUEST });
        const list = await getContinueWatchingService();
        dispatch({ type: watchConstants.CONTINUE_WATCHING_SUCCESS, payload: list });
    } catch (error) {
        dispatch({
            type: watchConstants.CONTINUE_WATCHING_FAIL,
            payload:
                error?.response?.data?.message ||
                error?.message ||
                "Failed to load continue watching",
        });
    }
};

export const deleteOnePlaybackAction = (token, movieId) => async (dispatch, getState) => {
    try {
        dispatch({ type: watchConstants.WATCH_DELETE_ONE_REQUEST });

        await deleteOnePlaybackService(token, movieId);

        dispatch({ type: watchConstants.WATCH_DELETE_ONE_SUCCESS, payload: { movieId } });

    } catch (error) {
        ErrorsAction(error, dispatch, watchConstants.WATCH_DELETE_ONE_FAIL);
    }
};

export const clearAllPlaybackAction = (token) => async (dispatch) => {
    try {
        dispatch({ type: watchConstants.WATCH_CLEAR_ALL_REQUEST });

        await clearAllPlaybackService(token);

        dispatch({ type: watchConstants.WATCH_CLEAR_ALL_SUCCESS });

    } catch (error) {
        ErrorsAction(error, dispatch, watchConstants.WATCH_CLEAR_ALL_FAIL);
    }
};