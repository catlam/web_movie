import React, { useEffect } from 'react'
import SideBar from '../SideBar'
import Table from '../../../Components/Table'
import { useDispatch, useSelector } from 'react-redux';
import { deleteAllMoviesAction, deleteMovieAction, getAllMoviesAction } from '../../../Redux/Actions/MoviesActions';
import toast from 'react-hot-toast';
import Loader from '../../../Components/Notifications/Loader';
import { Empty } from '../../../Components/Notifications/empty';
import { TbPlayerTrackNext, TbPlayerTrackPrev } from 'react-icons/tb';

function MoviesList() {
    const dispatch = useDispatch();
    const sameClass = "text-white p-2 rounded font-semibold border-2 border-subMain hover:bg-subMain";

    const { isLoading, isError, movies, pages, page } = useSelector(
        (state) => state.getAllMovies
    );
    const { isLoading: deleteLoading, isError: deleteError } = useSelector(
        (state) => state.deleteMovie
    );
    const { isLoading: allLoading, isError: allError } = useSelector(
        (state) => state.deleteAllMovies
    );

    // delete movie handler
    const deleteMovieHandler = (id) => {
        if (window.confirm("Are you sure you want to delete this movie?")) {
            dispatch(deleteMovieAction(id)).then(() => {
                // Sau khi xóa thành công, gọi lại danh sách phim
                dispatch(getAllMoviesAction({ pageNumber: page })); 
            });
        }
    }
    const deleteAllMoviesHandler = () => {
        window.confirm("Are you sure you want to delete all movies?") &&
            dispatch(deleteAllMoviesAction());
    }

    // useEffect
    useEffect(() => {
        dispatch(getAllMoviesAction({}))
        // error
        if (isError || deleteError || allError) {
            toast.error(isError)
        }
    }, [dispatch, isError, deleteError, allError])

    // pagination next and prev pages
    const nextPage = () => {
        dispatch(getAllMoviesAction({
            pageNumber: page + 1,
        }))
    }
    const prevPage = () => {
        dispatch(getAllMoviesAction({
            pageNumber: page - 1,
        }))
    }


    return (
        <SideBar>
            <div className="flex flex-col gap-6">
                <div className=" flex-btn gap-2">
                    <h2 className="text-xl font-bold">Movies List</h2>
                    {
                        movies?.length > 0 && <button
                            disabled={allLoading}
                            onClick={deleteAllMoviesHandler}
                            className="bg-main font-medium transition hover:bg-subMain border-subMain text-white py-3 px-6 rounded">
                            {allLoading ? "Deleting..." : "Delete All"}
                        </button>
                    }

                </div>

                {isLoading || deleteLoading ? (
                    <Loader />
                ) : movies?.length > 0 ? (
                    <>
                        <Table data={movies} admin={true} onDeleteHandler={deleteMovieHandler} />
                        {/* Loading More */}
                        <div className="w-full flex-rows gap-6 my-5">
                            <button
                                onClick={prevPage}
                                disabled={page === 1}
                                className={sameClass}>
                                <TbPlayerTrackPrev className="text-xl" />
                            </button>
                            <button
                                onClick={nextPage}
                                disabled={page === pages}
                                className={sameClass}>
                                <TbPlayerTrackNext className="text-xl" />
                            </button>
                        </div>
                    </>
                ) : (
                    <Empty message="You have no movies" />
                )}
            </div>
        </SideBar>
    )
}

export default MoviesList;