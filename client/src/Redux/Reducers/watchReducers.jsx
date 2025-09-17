import {
    CONTINUE_WATCHING_REQUEST,
    CONTINUE_WATCHING_SUCCESS,
    CONTINUE_WATCHING_FAIL,
} from "../Constants/watchConstants";

export const continueWatchingReducer = (
    state = { loading: false, items: [], error: null },
    action
) => {
    switch (action.type) {
        case CONTINUE_WATCHING_REQUEST:
            return { loading: true, items: [], error: null };
        case CONTINUE_WATCHING_SUCCESS:
            return { loading: false, items: action.payload, error: null };
        case CONTINUE_WATCHING_FAIL:
            return { loading: false, items: [], error: action.payload };
        default:
            return state;
    }
};
