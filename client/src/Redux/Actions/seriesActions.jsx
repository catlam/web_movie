// src/Redux/Actions/seriesActions.js
import toast from "react-hot-toast";
import { ErrorsAction, tokenProtection } from "../Protection";

import * as seriesConstants from "../Constants/seriesConstants";
import * as seriesApi from "../APIs//seriesServices";

// ============== SERIES ==============

// List series
const listSeriesAction = (query = {}) => async (dispatch) => {
    try {
        dispatch({ type: seriesConstants.SERIES_LIST_REQUEST });
        const response = await seriesApi.listSeriesService(query);
        dispatch({ type: seriesConstants.SERIES_LIST_SUCCESS, payload: response });
    } catch (error) {
        ErrorsAction(error, dispatch, seriesConstants.SERIES_LIST_FAIL);
    }
};

// Get series details
const getSeriesDetailsAction = (id) => async (dispatch) => {
    try {
        dispatch({ type: seriesConstants.SERIES_DETAILS_REQUEST });
        const response = await seriesApi.getSeriesByIdService(id);
        dispatch({ type: seriesConstants.SERIES_DETAILS_SUCCESS, payload: response });
    } catch (error) {
        ErrorsAction(error, dispatch, seriesConstants.SERIES_DETAILS_FAIL);
    }
};

// Create series (admin)
const createSeriesAction = (payload) => async (dispatch, getState) => {
    try {
        dispatch({ type: seriesConstants.SERIES_CREATE_REQUEST });
        const response = await seriesApi.createSeriesService(payload, tokenProtection(getState));
        dispatch({ type: seriesConstants.SERIES_CREATE_SUCCESS, payload: response });
        toast.success("Series created");
    } catch (error) {
        ErrorsAction(error, dispatch, seriesConstants.SERIES_CREATE_FAIL);
    }
};

// Update series (admin)
const updateSeriesAction = (id, payload) => async (dispatch, getState) => {
    try {
        dispatch({ type: seriesConstants.SERIES_UPDATE_REQUEST });
        const response = await seriesApi.updateSeriesService(id, payload, tokenProtection(getState));
        dispatch({ type: seriesConstants.SERIES_UPDATE_SUCCESS, payload: response });
        toast.success("Series updated");
    } catch (error) {
        ErrorsAction(error, dispatch, seriesConstants.SERIES_UPDATE_FAIL);
    }
};

// Delete series (admin)
const deleteSeriesAction = (id) => async (dispatch, getState) => {
    try {
        dispatch({ type: seriesConstants.SERIES_DELETE_REQUEST });
        const response = await seriesApi.deleteSeriesService(id, tokenProtection(getState));
        dispatch({ type: seriesConstants.SERIES_DELETE_SUCCESS, payload: response });
        toast.success("Series deleted");
    } catch (error) {
        ErrorsAction(error, dispatch, seriesConstants.SERIES_DELETE_FAIL);
    }
};

// Get summary (season/episode counts)
const getSeriesSummaryAction = (id) => async (dispatch) => {
    try {
        dispatch({ type: seriesConstants.SERIES_SUMMARY_REQUEST });
        const response = await seriesApi.getSeriesSummaryService(id);
        dispatch({ type: seriesConstants.SERIES_SUMMARY_SUCCESS, payload: response });
    } catch (error) {
        ErrorsAction(error, dispatch, seriesConstants.SERIES_SUMMARY_FAIL);
    }
};

// ============== SEASONS (under a series) ==============

// List seasons of a series
const listSeasonsBySeriesAction = (seriesId) => async (dispatch) => {
    try {
        dispatch({ type: seriesConstants.SEASON_LIST_BY_SERIES_REQUEST });
        const response = await seriesApi.listSeasonsBySeriesService(seriesId);
        dispatch({ type: seriesConstants.SEASON_LIST_BY_SERIES_SUCCESS, payload: response });
    } catch (error) {
        ErrorsAction(error, dispatch, seriesConstants.SEASON_LIST_BY_SERIES_FAIL);
    }
};

// Create season under a series (admin)
const createSeasonUnderSeriesAction = (seriesId, payload) => async (dispatch, getState) => {
    try {
        dispatch({ type: seriesConstants.SEASON_CREATE_REQUEST });
        const response = await seriesApi.createSeasonUnderSeriesService(
            seriesId,
            payload,
            tokenProtection(getState)
        );
        dispatch({ type: seriesConstants.SEASON_CREATE_SUCCESS, payload: response });
        toast.success("Season created");
    } catch (error) {
        ErrorsAction(error, dispatch, seriesConstants.SEASON_CREATE_FAIL);
    }
};

// review movie action
const reviewSeriesAction = ({ id, review }) => async (dispatch, getState) => {
    try {
        dispatch({ type: seriesConstants.CREATE_REVIEW_REQUEST })
        const response = await seriesApi.reviewSeriesService(
            tokenProtection(getState),
            id,
            review
        );
        dispatch({
            type: seriesConstants.CREATE_REVIEW_SUCCESS,
            payload: response
        })
        toast.success("Review created successfully!");
        dispatch({ type: seriesConstants.CREATE_REVIEW_RESET })
        dispatch(getSeriesDetailsAction(id));
    } catch (error) {
        ErrorsAction(error, dispatch, seriesConstants.CREATE_REVIEW_FAIL);
    }
}

// delete review movie action
const deleteReviewSeriesAction = (id) => async (dispatch, getState) => {
    try {
        dispatch({ type: seriesConstants.DELETE_REVIEW_REQUEST })
        const response = await seriesApi.deleteReviewSeriesService(
            tokenProtection(getState),
            id
        );
        dispatch({
            type: seriesConstants.DELETE_REVIEW_SUCCESS,
            payload: response
        })
        toast.success("Review deleted successfully!");
        dispatch(getSeriesDetailsAction(id));
    } catch (error) {
        ErrorsAction(error, dispatch, seriesConstants.DELETE_REVIEW_FAIL);
    }
}

export {
    listSeriesAction,
    getSeriesDetailsAction,
    createSeriesAction,
    updateSeriesAction,
    deleteSeriesAction,
    getSeriesSummaryAction,
    listSeasonsBySeriesAction,
    createSeasonUnderSeriesAction,
    reviewSeriesAction,
    deleteReviewSeriesAction
};
