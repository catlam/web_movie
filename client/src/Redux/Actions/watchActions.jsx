import {
    CONTINUE_WATCHING_REQUEST,
    CONTINUE_WATCHING_SUCCESS,
    CONTINUE_WATCHING_FAIL,
} from "../Constants/watchConstants";
import { getContinueWatchingService } from "../APIs/watchAPI";

export const getContinueWatchingAction = () => async (dispatch) => {
    try {
        dispatch({ type: CONTINUE_WATCHING_REQUEST });
        const list = await getContinueWatchingService();
        dispatch({ type: CONTINUE_WATCHING_SUCCESS, payload: list });
    } catch (error) {
        dispatch({
            type: CONTINUE_WATCHING_FAIL,
            payload:
                error?.response?.data?.message ||
                error?.message ||
                "Failed to load continue watching",
        });
    }
};
