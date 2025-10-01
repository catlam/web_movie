import * as watchConstants from "../Constants/watchConstants";
import { getContinueWatchingService } from "../APIs/watchAPI";
import { tokenProtection } from "../Protection";

export const getContinueWatchingAction = () => async (dispatch, getState) => {
    const token = tokenProtection(getState);
    if (!token) {
        dispatch({ type: watchConstants.CONTINUE_WATCHING_RESET });
        return;
    }

    try {
        dispatch({ type: watchConstants.CONTINUE_WATCHING_REQUEST });
        const list = await getContinueWatchingService();
        dispatch({ type: watchConstants.CONTINUE_WATCHING_SUCCESS, payload: list });
    } catch (error) {
        if (error?.response?.status === 401) {
            dispatch({ type: watchConstants.CONTINUE_WATCHING_RESET });
            return;
        }
        dispatch({
            type: watchConstants.CONTINUE_WATCHING_FAIL,
            payload:
                error?.response?.data?.message ||
                error?.message ||
                "Failed to load continue watching",
        });
    }
};
