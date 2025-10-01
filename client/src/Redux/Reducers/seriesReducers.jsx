// src/reducers/seriesReducers.js
import * as seriesConstants from "../Constants/seriesConstants";

export const seriesListReducer = (state = { items: [], page: 1, pages: 1, total: 0 }, action) => {
    switch (action.type) {
        case seriesConstants.SERIES_LIST_REQUEST:
            return { ...state, loading: true, error: null };
        case seriesConstants.SERIES_LIST_SUCCESS:
            return { loading: false, error: null, ...action.payload };
        case seriesConstants.SERIES_LIST_FAIL:
            return { ...state, loading: false, error: action.payload, items: [] };
        default:
            return state;
    }
};

export const seriesDetailsReducer = (state = { series: null }, action) => {
    switch (action.type) {
        case seriesConstants.SERIES_DETAILS_REQUEST:
            return { ...state, loading: true, error: null };
        case seriesConstants.SERIES_DETAILS_SUCCESS:
            return { loading: false, error: null, series: action.payload };
        case seriesConstants.SERIES_DETAILS_FAIL:
            return { ...state, loading: false, error: action.payload, series: null };
        default:
            return state;
    }
};

export const seriesCreateReducer = (state = {}, action) => {
    switch (action.type) {
        case seriesConstants.SERIES_CREATE_REQUEST:
            return { loading: true };
        case seriesConstants.SERIES_CREATE_SUCCESS:
            return { loading: false, success: true, series: action.payload };
        case seriesConstants.SERIES_CREATE_FAIL:
            return { loading: false, error: action.payload };
        case seriesConstants.SERIES_CREATE_RESET:
            return {};
        default:
            return state;
    }
};

export const seriesUpdateReducer = (state = {}, action) => {
    switch (action.type) {
        case seriesConstants.SERIES_UPDATE_REQUEST:
            return { loading: true };
        case seriesConstants.SERIES_UPDATE_SUCCESS:
            return { loading: false, success: true, series: action.payload };
        case seriesConstants.SERIES_UPDATE_FAIL:
            return { loading: false, error: action.payload };
        case seriesConstants.SERIES_UPDATE_RESET:
            return {};
        default:
            return state;
    }
};

export const seriesDeleteReducer = (state = {}, action) => {
    switch (action.type) {
        case seriesConstants.SERIES_DELETE_REQUEST:
            return { loading: true };
        case seriesConstants.SERIES_DELETE_SUCCESS:
            return { loading: false, success: true, result: action.payload };
        case seriesConstants.SERIES_DELETE_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
};

export const seriesSummaryReducer = (state = { summary: null }, action) => {
    switch (action.type) {
        case seriesConstants.SERIES_SUMMARY_REQUEST:
            return { ...state, loading: true, error: null };
        case seriesConstants.SERIES_SUMMARY_SUCCESS:
            return { loading: false, error: null, summary: action.payload };
        case seriesConstants.SERIES_SUMMARY_FAIL:
            return { loading: false, error: action.payload, summary: null };
        default:
            return state;
    }
};

// Seasons under series
export const seasonListBySeriesReducer = (state = { seasons: [] }, action) => {
    switch (action.type) {
        case seriesConstants.SEASON_LIST_BY_SERIES_REQUEST:
            return { ...state, loading: true, error: null };
        case seriesConstants.SEASON_LIST_BY_SERIES_SUCCESS:
            return { loading: false, error: null, seasons: action.payload };
        case seriesConstants.SEASON_LIST_BY_SERIES_FAIL:
            return { loading: false, error: action.payload, seasons: [] };
        default:
            return state;
    }
};

export const seasonCreateReducer = (state = {}, action) => {
    switch (action.type) {
        case seriesConstants.SEASON_CREATE_REQUEST:
            return { loading: true };
        case seriesConstants.SEASON_CREATE_SUCCESS:
            return { loading: false, success: true, season: action.payload };
        case seriesConstants.SEASON_CREATE_FAIL:
            return { loading: false, error: action.payload };
        case seriesConstants.SEASON_CREATE_RESET:
            return {};
        default:
            return state;
    }
};

// CREATE REVIEW
export const createReviewReducer = (state = {}, action) => {
    switch (action.type) {
        case seriesConstants.CREATE_REVIEW_REQUEST:
            return { isLoading: true };
        case seriesConstants.CREATE_REVIEW_SUCCESS:
            return { isLoading: false, isSuccess: true }
        case seriesConstants.CREATE_REVIEW_FAIL:
            return { isLoading: false, isError: action.payload };
        case seriesConstants.CREATE_REVIEW_RESET:
            return {};
        default:
            return state;

    }
};

// DELETE REVIEW
export const deleteReviewReducer = (state = {}, action) => {
    switch (action.type) {
        case seriesConstants.DELETE_REVIEW_REQUEST:
            return { isLoading: true };
        case seriesConstants.DELETE_REVIEW_SUCCESS:
            return { isLoading: false, isSuccess: true }
        case seriesConstants.DELETE_REVIEW_FAIL:
            return { isLoading: false, isError: action.payload };
        default:
            return state;

    }
};