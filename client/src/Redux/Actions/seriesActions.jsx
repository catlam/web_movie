// src/Redux/Actions/seriesActions.js
import toast from "react-hot-toast";
import { ErrorsAction, tokenProtection } from "../Protection";

import * as seriesConstants from "../Constants/seriesConstants";
import * as seriesApi from "../APIs/seriesServices";
import * as episodeApi from "../APIs/episodeServices";
import * as seasonApi from "../APIs/seasonServices";



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

        // 1) Lấy series gốc
        const base = await seriesApi.getSeriesByIdService(id);

        // 2) Đảm bảo có danh sách seasons
        let seasons = Array.isArray(base.seasons) ? base.seasons : [];
        if (seasons.length === 0) {
            seasons = await seriesApi.listSeasonsBySeriesService(id);
        }

        // 3) Đảm bảo mỗi season có episodes
        const seasonsWithEpisodes = await Promise.all(
            seasons.map(async (s) => {
                let eps = Array.isArray(s.episodes) ? s.episodes : [];
                if (eps.length === 0) {
                    eps = await seasonApi.listEpisodesBySeasonService(s._id);
                }
                return { ...s, episodes: eps };
            })
        );

        // 4) Tạo mảng episodes phẳng ở cấp series (cho UI dùng nhanh)
        const flatEpisodes = seasonsWithEpisodes.flatMap((s) => s.episodes || []);

        // 5) Hợp nhất vào 1 object series đầy đủ cho UI
        const merged = {
            ...base,
            seasons: seasonsWithEpisodes,
            episodes: Array.isArray(base.episodes) && base.episodes.length > 0
                ? base.episodes
                : flatEpisodes,
            useSeasons: seasonsWithEpisodes.length > 0,
        };

        dispatch({ type: seriesConstants.SERIES_DETAILS_SUCCESS, payload: merged });
    } catch (err) {
        const msg = err?.response?.data?.message || err.message || "Failed to load series";
        dispatch({ type: seriesConstants.SERIES_DETAILS_FAIL, payload: msg });
    }
};

// Create series (admin)
// const createSeriesAction = (payload) => async (dispatch, getState) => {
//     try {
//         dispatch({ type: seriesConstants.SERIES_CREATE_REQUEST });
//         const response = await seriesApi.createSeriesService(payload, tokenProtection(getState));
//         dispatch({ type: seriesConstants.SERIES_CREATE_SUCCESS, payload: response });
//         toast.success("Series created");
//     } catch (error) {
//         ErrorsAction(error, dispatch, seriesConstants.SERIES_CREATE_FAIL);
//     }
// };

const createSeriesAction = (payload) => async (dispatch, getState) => {
    const token = tokenProtection(getState);
    try {
        dispatch({ type: seriesConstants.SERIES_CREATE_REQUEST });

        // 1) Tạo Series
        console.group("[createSeriesAction] STEP 1: POST /series");
        const baseBody = {
            name: payload.name,
            language: payload.language,
            year: payload.year,
            category: payload.category,
            desc: payload.desc,
            image: payload.image,         // backdrop
            titleImage: payload.titleImage, // poster
            isPremium: !!payload.isPremium,
        };
        console.log("body:", baseBody);

        const createdSeries = await seriesApi.createSeriesService(baseBody, {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log("=> created series:", createdSeries);
        console.groupEnd();

        const seriesId = createdSeries?._id || createdSeries?.id;
        if (!seriesId) throw new Error("Series created but no _id returned");

        // 2) Tạo Seasons (nếu có)
        const localMap = new Map(); // _localId -> real seasonId
        if (payload.useSeasons && Array.isArray(payload.seasons) && payload.seasons.length) {
            console.group("[createSeriesAction] STEP 2: POST /series/:id/seasons");
            for (const s of payload.seasons) {
                const body = { name: s.name, seasonNumber: Number(s.seasonNumber) };
                console.log(`POST /series/${seriesId}/seasons`, body);
                const createdSeason = await seriesApi.createSeasonUnderSeriesService(
                    seriesId,
                    body,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const seasonId = createdSeason?._id || createdSeason?.id;
                console.log("=> created season:", createdSeason);
                localMap.set(s._localId, seasonId);
            }
            console.groupEnd();
        }

        // 3) Tạo Episodes (bắt buộc phải có theo yêu cầu)
        if (!Array.isArray(payload.episodes) || payload.episodes.length === 0) {
            throw new Error("At least 1 episode is required");
        }

        console.group("[createSeriesAction] STEP 3: POST episodes");
        for (const e of payload.episodes) {
            const body = {
                title: e.title || e.name,  
                episodeNumber: Number(e.episodeNumber),
                runtime: Number(e.runtime),
                video: e.video,
            };

            if (payload.useSeasons) {
                const seasonId = localMap.get(e.seasonLocalId);
                if (!seasonId) {
                    console.warn("Cannot map seasonLocalId for episode:", e);
                    continue;
                }
                console.log(`POST /seasons/${seasonId}/episodes`, body);
                await episodeApi.createEpisodeUnderSeasonService(
                    seasonId,
                    body,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } 
        }
        console.groupEnd();

        toast.success("Series created with seasons & episodes!");
        dispatch({ type: seriesConstants.SERIES_CREATE_SUCCESS });

    } catch (err) {
        const msg = err?.response?.data?.message || err.message || "Create series failed";
        console.error("[createSeriesAction] ERROR:", msg);
        toast.error(msg);
        dispatch({ type: seriesConstants.SERIES_CREATE_FAIL, payload: msg });
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
