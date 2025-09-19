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

        case watchConstants.WATCH_DELETE_ONE_SUCCESS:
            return {
                ...state,
                items: (state.items || []).filter(
                    (it) => it.movieId !== action.payload.movieId
                ),
            }; 
            
        case watchConstants.WATCH_CLEAR_ALL_SUCCESS:
            return { ...state, items: [] };    

        default:
            return state;
    }
};

export const watchDeleteOneReducer = (state = {}, action) => {
    switch (action.type) {
        case watchConstants.WATCH_DELETE_ONE_REQUEST:
            return { loading: true };
        case watchConstants.WATCH_DELETE_ONE_SUCCESS:
            return { loading: false, success: true };
        case watchConstants.WATCH_DELETE_ONE_FAIL:
            return { loading: false, error: action.payload };
        case watchConstants.WATCH_DELETE_ONE_RESET:
            return {};
        default:
            return state;
    }
};

export const watchClearAllReducer = (state = {}, action) => {
    switch (action.type) {
        case watchConstants.WATCH_CLEAR_ALL_REQUEST:
            return { loading: true };
        case watchConstants.WATCH_CLEAR_ALL_SUCCESS:
            return { loading: false, success: true };
        case watchConstants.WATCH_CLEAR_ALL_FAIL:
            return { loading: false, error: action.payload };
        case watchConstants.WATCH_CLEAR_ALL_RESET:
            return {};
        default:
            return state;
    }
};