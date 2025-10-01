import React from 'react';
import Titles from '../Titles';
import { BsCollectionFill } from 'react-icons/bs';
import SeriesCard from '../SeriesCard'; 
import { Empty } from '../Notifications/empty';
import Loader from '../Notifications/Loader';

function PopularSeries({ isLoading, series }) {
    return (
        <div className="my-16">
            <Titles title="Popular Series" Icon={BsCollectionFill} />
            {isLoading ? (
                <Loader />
            ) : series?.length > 0 ? (
                <div className="grid sm:mt-12 mt-6 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-10">
                    {series.slice(0, 8).map((s, idx) => (
                        <SeriesCard key={s._id || idx} series={s} />
                    ))}
                </div>
            ) : (
                <div className="mt-6">
                    <Empty message="It seem's like we don't have any series" />
                </div>
            )}
        </div>
    );
}

export default PopularSeries;
