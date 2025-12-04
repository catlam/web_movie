import React, { useState } from 'react';
import Titles from '../Titles';
import { BsCollectionFill } from 'react-icons/bs';
import { TbPlayerTrackNext, TbPlayerTrackPrev } from 'react-icons/tb';
import Movie from '../Movie';
import { Empty } from '../Notifications/empty';
import Loader from '../Notifications/Loader';
import { AnimatePresence, motion } from 'framer-motion';

function PopularMovies({ isLoading, movies = [] }) {
  const pageSize = 8;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(movies.length / pageSize));

  const start = (page - 1) * pageSize;
  const currentMovies = movies.slice(start, start + pageSize);

  const sameClass =
    'text-white py-2 px-4 rounded font-semibold border-2 border-subMain hover:bg-subMain disabled:opacity-40 disabled:cursor-not-allowed';

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));

  // animation
  const variants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="my-16 relative">
      <Titles title="Popular Movies" Icon={BsCollectionFill} />

      {isLoading ? (
        <Loader />
      ) : movies.length > 0 ? (
        <>
          {/* Grid + animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="grid sm:mt-12 mt-6 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-10"
            >
              {currentMovies.map((movie, index) => (
                <Movie key={movie._id || index} movie={movie} />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Pagination controls */}
          <div className="flex justify-center items-center gap-6 mt-10">
            <button onClick={prevPage} disabled={page === 1} className={sameClass}>
              <TbPlayerTrackPrev className="text-xl" />
            </button>
            <span className="text-white text-sm">
              Page <b>{page}</b> / {totalPages}
            </span>
            <button onClick={nextPage} disabled={page === totalPages} className={sameClass}>
              <TbPlayerTrackNext className="text-xl" />
            </button>
          </div>
        </>
      ) : (
        <div className="mt-6">
          <Empty message="It seem's like we don't have any movie" />
        </div>
      )}
    </div>
  );
}

export default PopularMovies;
