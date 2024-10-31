import * as CategoriesConstants from "../Constants/categoriesConstants";
import * as categoriesAPIs from "../APIs/categoriesServices";
import toast from "react-hot-toast";
import {ErrorsAction, tokenProtection} from "../Protection";

// Get all Categories action
export const getAllCategoriesAction = () => async (dispatch) => {
    try {
        dispatch({ type: CategoriesConstants.GET_ALL_CATEGORIES_REQUEST });
        const data = await categoriesAPIs.getCategoriesService();
        dispatch({ type: CategoriesConstants.GET_ALL_CATEGORIES_SUCCESS, payload:data });
    } catch (error) {
      ErrorsAction(error, dispatch, CategoriesConstants.GET_ALL_CATEGORIES_FAIL);
    }
};

// create category action
export const createCategoryAction = (title) => async (dispatch, getState) => {
    try {
        dispatch({ type: CategoriesConstants.CREATE_CATEGORY_REQUEST });
        await categoriesAPIs.createCategoryService(title, tokenProtection(getState));
        toast.success("Category created successfully!");
        dispatch({ type: CategoriesConstants.CREATE_CATEGORY_SUCCESS });
        toast.success("Category created successfully");
        dispatch(getAllCategoriesAction())

    } catch (error) {
        ErrorsAction(error, dispatch, CategoriesConstants.CREATE_CATEGORY_FAIL);
    }
};

// update category action
export const updateCategoryAction = (id, title) => async (dispatch, getState) => {
    try {
        dispatch({ type: CategoriesConstants.UPDATE_CATEGORY_REQUEST });
        await categoriesAPIs.updateCategoryService(id, title, tokenProtection(getState));
        toast.success("Category updated successfully!");
        dispatch({ type: CategoriesConstants.UPDATE_CATEGORY_SUCCESS });
        toast.success("Category updated successfully");
        dispatch(getAllCategoriesAction())
    } catch (error) {
        ErrorsAction(error, dispatch, CategoriesConstants.UPDATE_CATEGORY_FAIL);
    }
};

// delete category action
export const deleteCategoryAction = (id) => async (dispatch, getState) => {
    try {
        dispatch({ type: CategoriesConstants.DELETE_CATEGORY_REQUEST });
        await categoriesAPIs.deleteCategoryService(id, tokenProtection(getState));
        toast.success("Category deleted successfully!");
        dispatch({ type: CategoriesConstants.DELETE_CATEGORY_SUCCESS });
        toast.success("Category deleted successfully");
        dispatch(getAllCategoriesAction())
    } catch (error) {
        ErrorsAction(error, dispatch, CategoriesConstants.DELETE_CATEGORY_FAIL);
    }
};