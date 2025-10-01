import React, { useEffect } from 'react';
import Layout from '../Layout/Layout';
import Banner from '../Components/Home/Banner';
import Promos from '../Components/Home/Promos';
import TopRated from '../Components/Home/TopRated';
import PopularMovies from '../Components/Home/PopularMovies';
import ViewHistory from '../Components/Home/ViewHistory';
import PopularSeries from '../Components/Home/PopularSeries';

import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import { getAllMoviesAction, getRandomMoviesAction, getTopRatedMovieAction } from '../Redux/Actions/MoviesActions';
import { listSeriesAction } from '../Redux/Actions/seriesActions'; // ⬅️ import action series

function HomeScreen() {
  const dispatch = useDispatch();

  // Movies selectors
  const { isLoading: randomLoading, isError: randomError, movies: randomMovies } =
    useSelector((state) => state.getRandomMovies);
  const { isLoading: topLoading, isError: topError, movies: topMovies } =
    useSelector((state) => state.getTopRatedMovie);
  const { isLoading: allMoviesLoading, isError: allMoviesError, movies: allMovies } =
    useSelector((state) => state.getAllMovies);

  // Series selector (từ reducer seriesList)
  const {
    loading: seriesLoading,
    error: seriesError,
    items: seriesItems,
  } = useSelector((state) => state.seriesList || {});

  // Fetch data
  useEffect(() => {
    dispatch(getRandomMoviesAction());
    dispatch(getAllMoviesAction({}));
    dispatch(getTopRatedMovieAction());
    // Popular Series: sort theo rate giảm dần, lấy 8 item
    dispatch(listSeriesAction({ limit: 8, sort: 'rate_desc' }));
  }, [dispatch]);

  // Toast lỗi
  useEffect(() => {
    if (randomError || topError || allMoviesError || seriesError) {
      toast.error('Something went wrong!');
    }
  }, [randomError, topError, allMoviesError, seriesError]);

  return (
    <Layout>
      <div className="container mx-auto min-h-screen px-2 mb-6">
        <Banner movies={allMovies} isLoading={allMoviesLoading} />
        <ViewHistory movies={allMovies} isLoading={allMoviesLoading} />
        <PopularMovies movies={randomMovies} isLoading={randomLoading} />
        <PopularSeries isLoading={seriesLoading} series={seriesItems} /> 
        <Promos />
        <TopRated movies={topMovies} isLoading={topLoading} />
      </div>
    </Layout>
  );
}

export default HomeScreen;
