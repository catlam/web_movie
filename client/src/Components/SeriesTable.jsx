import React from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { GoEye } from 'react-icons/go';
import { Link } from 'react-router-dom';

const Head = "text-xs text-left text-main font-semibold px-6 py-2 uppercase";
const Text = "text-sm text-left leading-6 whitespace-nowrap px-6 py-3";

// 1 dòng trong bảng
const Row = (series, i, onDeleteHandler, admin) => {
    return (
        <tr key={series?._id || i}>
            <td className={Text}>
                <div className="w-12 p-1 bg-dry border border-border h-12 rounded overflow-hidden">
                    <img
                        className="h-full w-full object-cover"
                        src={series?.image ? series.image : "/images/user.png"}
                        alt={series?.name || 'series'}
                    />
                </div>
            </td>

            <td className={`${Text} truncate`}>{series?.name}</td>
            <td className={Text}>{series?.category}</td>
            <td className={Text}>{series?.language}</td>
            <td className={Text}>{series?.year}</td>

            <td className={`${Text} float-right flex-rows gap-2`}>
                {admin ? (
                    <>
                        {/* EDIT -> /editSeries/:id */}
                        <Link
                            to={`/editSeries/${series?._id}`}
                            className="border border-order bg-dry flex-rows gap-2 text-border rounded py-1 px-2"
                        >
                            Edit <FaEdit className="text-green-500" />
                        </Link>

                        {/* DELETE */}
                        <button
                            onClick={() => onDeleteHandler(series?._id)}
                            className="bg-subMain text-white rounded flex-colo w-6 h-6"
                            title="Delete series"
                        >
                            <MdDelete />
                        </button>
                    </>
                ) : (
                    <>
                        {/* DELETE (nếu muốn dùng ngoài admin) */}
                        <button
                            onClick={() => onDeleteHandler(series?._id)}
                            className="border border-order bg-dry flex-rows gap-2 text-border rounded py-1 px-2"
                        >
                            Delete <FaTrashAlt className="text-green-500" />
                        </button>

                        {/* VIEW -> /series/:id */}
                        <Link
                            to={`/series/${series?._id}`}
                            className="bg-subMain text-white rounded flex-colo w-6 h-6"
                            title="View series"
                        >
                            <GoEye />
                        </Link>
                    </>
                )}
            </td>
        </tr>
    );
};

// Bảng Series
function SeriesTable({ data = [], admin = true, onDeleteHandler }) {
    return (
        <div className="overflow-x-auto overflow-hidden relative w-full">
            <table className="w-full table-auto border border-border divide-y divide-border">
                <thead>
                    <tr className="bg-dryGray">
                        <th className={Head}>Image</th>
                        <th className={Head}>Name</th>
                        <th className={Head}>Category</th>
                        <th className={Head}>Language</th>
                        <th className={Head}>Year</th>
                        <th className={`${Head} text-end`}>Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-main divide-y divide-gray-800">
                    {data.map((item, i) => Row(item, i, onDeleteHandler, admin))}
                </tbody>
            </table>
        </div>
    );
}

export default SeriesTable;
