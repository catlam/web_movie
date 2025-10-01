import * as watchConstants from "../Constants/watchConstants";

export const continueWatchingReducer = (
    state = { loading: false, items: [], error: null },
    action
) => {
    switch (action.type) {
        case watchConstants.CONTINUE_WATCHING_REQUEST:
            return { loading: true, items: [], error: null };
        case watchConstants.CONTINUE_WATCHING_SUCCESS:
            return { loading: false, items: action.payload, error: null };
        case watchConstants.CONTINUE_WATCHING_FAIL:
            return { loading: false, items: [], error: action.payload };
        case watchConstants.CONTINUE_WATCHING_RESET:
            return { loading: false, items: [], error: null };
        default:
            return state;
    }
};
