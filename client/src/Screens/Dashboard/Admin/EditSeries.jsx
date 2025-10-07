import React, { useEffect, useMemo, useState } from 'react';
import SideBar from '../SideBar';
import { Input, Message, Select } from '../../../Components/UsedInputs';
import Uploader from '../../../Components/Uploader';
import { Imagepreview } from '../../../Components/ImagePreview';
import Titles from '../../../Components/Titles';
import { MdDelete } from 'react-icons/md';
import { FaPlus, FaListUl } from 'react-icons/fa';
import { ImUpload } from 'react-icons/im';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { InlineError } from '../../../Components/Notifications/Error';
import Loader from '../../../Components/Notifications/Loader';

import {
    getSeriesDetailsAction,
    updateSeriesAction,
} from '../../../Redux/Actions/seriesActions';
import {
    updateEpisodeAction,
    createEpisodeUnderSeasonAction,
} from '../../../Redux/Actions/episodeActions';


function EditSeries() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    // categories
    const { categories } = useSelector((state) => state.categoryGetAll || {});

    // ✅ Đúng slice & field theo reducer hay dùng: { loading, error, series }
    const {
        loading: seriesLoading,
        error: seriesError,
        series = {},
    } = useSelector((s) => s.seriesDetails || {});

    // update status
    const {
        isLoading: editLoading = false,
        isSuccess: editSuccess = false,
        isError: editError = null,
    } = useSelector((s) => s.updateSeries || {});

    // Local states
    const [backdropUrl, setBackdropUrl] = useState('');
    const [backdropLink, setBackdropLink] = useState('');
    const [posterUrl, setPosterUrl] = useState('');
    const [posterLink, setPosterLink] = useState('');
    const [useSeasons, setUseSeasons] = useState(false);

    const [seasonName, setSeasonName] = useState('');
    const [seasonNumber, setSeasonNumber] = useState('');
    const [seasons, setSeasons] = useState([]);

    const [epName, setEpName] = useState('');
    const [epNumber, setEpNumber] = useState('');
    const [epRuntime, setEpRuntime] = useState('');
    const [epVideoUrl, setEpVideoUrl] = useState('');
    const [epVideoLink, setEpVideoLink] = useState('');
    const [epSeasonId, setEpSeasonId] = useState('');
    const [episodes, setEpisodes] = useState([]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    // final images
    const finalBackdrop = backdropLink?.trim() || backdropUrl || '';
    const finalPoster = posterLink?.trim() || posterUrl || '';

    // options
    const categoriesOptions = useMemo(() => {
        return (categories || []).map((c) => ({
            title: c?.title || c?.name || String(c),
            value: c?.title || c?.name || String(c),
        }));
    }, [categories]);

    // fetch series
    useEffect(() => {
        if (id) dispatch(getSeriesDetailsAction(id));
    }, [dispatch, id]);

    // khi series về -> nạp form & local states
    useEffect(() => {
        if (!series || !series._id) return;

        // fill form
        reset({
            name: series.name || '',
            language: series.language || '',
            year: series.year || '',
            category: series.category || '',
            desc: series.desc || '',
            // ❌ bỏ tags: KHÔNG set vào form, KHÔNG hiển thị
        });

        // images
        setBackdropUrl(series.image || '');
        setBackdropLink('');
        setPosterUrl(series.titleImage || '');
        setPosterLink('');

        // seasons toggle
        setUseSeasons(!!series.useSeasons);

        // map seasons -> _localId
        const localSeasons = Array.isArray(series.seasons)
            ? series.seasons.map((s) => ({
                _localId: crypto.randomUUID(),
                name: s.name,
                seasonNumber: s.seasonNumber,
                _serverId: s._id,
            }))
            : [];
        setSeasons(localSeasons);

        // episodes (nếu backend trả trong series)
        const localEpisodes = Array.isArray(series.episodes)
            ? series.episodes.map((e) => ({
                _localId: crypto.randomUUID(),
                _serverId: e._id, 
                title: e.title || e.name || '', 
                episodeNumber: e.episodeNumber,
                runtime: e.runtime,
                video: e.video,
                seasonLocalId:
                    localSeasons.find((s) => s._serverId === (e.season?._id || e.season))?._localId ||
                    null,
            }))
            : [];
        setEpisodes(localEpisodes);

        // default chọn season đầu cho add episode
        if (localSeasons.length > 0) {
            setEpSeasonId(localSeasons[0]._localId);
        } else {
            setEpSeasonId('');
        }
    }, [series, reset]);

    useEffect(() => {
        console.log('[DEBUG] Series details received:', series);
    }, [series]);


    // handlers
    const addSeason = () => {
        if (!seasonName?.trim()) return toast.error('Season name is required');
        const num = Number(seasonNumber);
        if (!Number.isFinite(num) || num <= 0) return toast.error('Season number must be > 0');

        const exists = seasons.some((s) => Number(s.seasonNumber) === num);
        if (exists) return toast.error(`Season ${num} already exists`);

        const newSeason = {
            _localId: crypto.randomUUID(),
            name: seasonName.trim(),
            seasonNumber: num,
        };
        setSeasons((prev) => [...prev, newSeason].sort((a, b) => a.seasonNumber - b.seasonNumber));
        setSeasonName('');
        setSeasonNumber('');
        if (!epSeasonId) setEpSeasonId(newSeason._localId);
    };

    const removeSeason = (localId) => {
        setSeasons((prev) => prev.filter((s) => s._localId !== localId));
        setEpisodes((prev) => prev.filter((e) => e.seasonLocalId !== localId));
        if (epSeasonId === localId) {
            const remain = seasons.filter((s) => s._localId !== localId);
            setEpSeasonId(remain[0]?._localId || '');
        }
    };

    const addEpisode = () => {
        if (!epName?.trim()) return toast.error('Episode name is required');
        const num = Number(epNumber);
        if (!Number.isFinite(num) || num <= 0) return toast.error('Episode number must be > 0');
        const runtime = Number(epRuntime);
        if (!Number.isFinite(runtime) || runtime <= 0) return toast.error('Runtime must be > 0');

        const video = epVideoLink?.trim() || epVideoUrl || '';
        if (!video) return toast.error('Episode video is required (upload or paste link)');

        let seasonLocalId = undefined;
        if (useSeasons) {
            if (!epSeasonId) return toast.error('Please select a season for this episode');
            seasonLocalId = epSeasonId;
        }

        const conflict = episodes.some(
            (e) =>
                Number(e.episodeNumber) === num &&
                (useSeasons ? e.seasonLocalId === seasonLocalId : true)
        );
        if (conflict) {
            return toast.error(
                useSeasons
                    ? `Episode ${num} already exists in the selected season`
                    : `Episode ${num} already exists`
            );
        }

        const newEp = {
            _localId: crypto.randomUUID(),
            title: epName.trim(),
            episodeNumber: num,
            runtime,
            video,
            seasonLocalId,
        };
        setEpisodes((prev) => [...prev, newEp].sort((a, b) => a.episodeNumber - b.episodeNumber));

        setEpName('');
        setEpNumber('');
        setEpRuntime('');
        setEpVideoUrl('');
        setEpVideoLink('');
    };

    const updateEpField = (localId, field, value) => {
        setEpisodes(prev =>
            prev.map(ep =>
                ep._localId === localId ? { ...ep, [field]: value } : ep
            )
        );
    };

    const getSeasonServerIdByLocal = (localId) => {
        const found = seasons.find((s) => s._localId === localId);
        return found?._serverId || null; 
    };

    const saveEpisodes = async () => {
        const tasks = episodes.map(async (ep) => {
            const seasonIdResolved = useSeasons
                ? getSeasonServerIdByLocal(ep.seasonLocalId) || ep._serverSeasonId || null
                : ep._serverSeasonId || null;

            const payload = {
                title: ep.title?.trim() || '',
                episodeNumber: Number(ep.episodeNumber) || 1,
                runtime: Number(ep.runtime) || 0,
                video: ep.video || '',
                ...(seasonIdResolved ? { seasonId: seasonIdResolved } : {}),
            };

            if (ep._serverId) {
                // update tập đã có
                await dispatch(updateEpisodeAction(ep._serverId, payload));
            } else {
                // tạo mới nếu chưa có
                if (!seasonIdResolved)
                    throw new Error(`Episode "${ep.title || 'Untitled'}" is missing season`);
                const created = await dispatch(createEpisodeUnderSeasonAction(seasonIdResolved, payload));
                // optional: cập nhật lại state nếu muốn dùng liền không reload
                if (created?.payload?._id) {
                    setEpisodes((prev) =>
                        prev.map((x) =>
                            x._localId === ep._localId
                                ? { ...x, _serverId: created.payload._id, _serverSeasonId: seasonIdResolved }
                                : x
                        )
                    );
                }
            }
        });

        await Promise.all(tasks);
    };

    const removeEpisode = (localId) => {
        setEpisodes((prev) => prev.filter((e) => e._localId !== localId));
    };

    const onSubmit = async (data) => {
        const payload = {
            name: data.name.trim(),
            language: data.language?.trim() || '',
            year: Number(data.year) || new Date().getFullYear(),
            category: data.category,
            desc: data.desc || '',
            image: finalBackdrop,
            titleImage: finalPoster,
        };

        try {
            await dispatch(updateSeriesAction(id, payload)); // cập nhật series
            await saveEpisodes();                            // cập nhật/tạo episodes
            toast.success('Series & episodes updated!');
            await dispatch(getSeriesDetailsAction(id));
            navigate('/seriesList');
        } catch (err) {
            console.error(err);
            toast.error('Failed to update series or episodes');
        }
    };


    // update status
    useEffect(() => {
        if (editSuccess) {
            toast.success('Series updated successfully!');
            navigate('/seriesList');
        }
        if (editError) {
            toast.error(typeof editError === 'string' ? editError : 'Failed to update series');
        }
    }, [editSuccess, editError, navigate]);

    const seasonOptions = useMemo(
        () =>
            seasons.map((s) => ({
                value: s._localId,
                title: s.name || `Season ${s.seasonNumber}`,
            })),
        [seasons]
    );

    if (seriesLoading) return <Loader />;

    if (seriesError)
        return (
            <SideBar>
                <div className="text-center text-red-400 py-10">Failed to load series info.</div>
            </SideBar>
        );

    return (
        <SideBar>
            <div className="flex flex-col gap-6">
                <h2 className="text-xl font-bold">Edit Series: {series?.name}</h2>

                {/* Basic info */}
                <div className="w-full grid md:grid-cols-2 gap-6">
                    <div className="w-full">
                        <Input label="Series Title" type="text" bg name="name" register={register('name')} />
                        {errors.name && <InlineError text={errors.name.message} />}
                    </div>
                    <div className="w-full">
                        <Input label="Language" type="text" bg name="language" register={register('language')} />
                        {errors.language && <InlineError text={errors.language.message} />}
                    </div>
                </div>

                <div className="w-full grid md:grid-cols-2 gap-6">
                    <div className="w-full">
                        <Input label="Year" type="number" bg name="year" register={register('year')} />
                        {errors.year && <InlineError text={errors.year.message} />}
                    </div>
                    <div className="text-sm w-full">
                        <Select
                            label="Category"
                            options={categoriesOptions}
                            name="category"
                            register={{ ...register('category') }}
                        />
                        {errors.category && <InlineError text={errors.category.message} />}
                    </div>
                </div>

                {/* Images */}
                <Titles title="Images" Icon={FaListUl} />
                <div className="w-full grid md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-3">
                        <p className="text-border font-semibold text-sm">Backdrop</p>
                        <Uploader setImageUrl={setBackdropUrl} />
                        <Input
                            label="Or paste Image URL"
                            placeholder="https://..."
                            type="text"
                            bg
                            name="backdropLink"
                            value={backdropLink}
                            onChange={(e) => setBackdropLink(e.target.value)}
                        />
                        <Imagepreview image={finalBackdrop} name="backdrop" />
                    </div>
                    <div className="flex flex-col gap-3">
                        <p className="text-border font-semibold text-sm">Poster</p>
                        <Uploader setImageUrl={setPosterUrl} />
                        <Input
                            label="Or paste Image URL"
                            placeholder="https://..."
                            type="text"
                            bg
                            name="posterLink"
                            value={posterLink}
                            onChange={(e) => setPosterLink(e.target.value)}
                        />
                        <Imagepreview image={finalPoster} name="poster" />
                    </div>
                </div>
                

                {/* Description */}
                <Message
                    label="Series Description"
                    placeholder="Description"
                    name="desc"
                    register={{ ...register('desc') }}
                />

                {/* Use seasons */}
                <label className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        className="w-4 h-4 accent-subMain"
                        checked={useSeasons}
                        onChange={(e) => setUseSeasons(e.target.checked)}
                    />
                    <span className="text-sm text-border">Use Seasons</span>
                </label>

                {/* Seasons */}
                {useSeasons && (
                    <>
                        <Titles title="Seasons" Icon={FaListUl} />
                        <div className="w-full grid md:grid-cols-3 gap-4">
                            <Input
                                label="Season Name"
                                type="text"
                                bg
                                value={seasonName}
                                onChange={(e) => setSeasonName(e.target.value)}
                            />
                            <Input
                                label="Season Number"
                                type="number"
                                bg
                                value={seasonNumber}
                                onChange={(e) => setSeasonNumber(e.target.value)}
                            />
                            <button
                                onClick={addSeason}
                                className="bg-subMain text-white rounded flex items-center justify-center gap-2 px-4"
                            >
                                <FaPlus /> Add
                            </button>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                            {seasons.map((s) => (
                                <div key={s._localId} className="p-4 rounded bg-main border border-border">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">{s.name}</p>
                                            <p className="text-xs text-border">Season {s.seasonNumber}</p>
                                        </div>
                                        <button
                                            onClick={() => removeSeason(s._localId)}
                                            className="w-7 h-7 flex items-center justify-center rounded bg-dry border border-border text-red-400"
                                        >
                                            <MdDelete />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Episodes */}
                <Titles title="Episodes" Icon={FaListUl} />
                <div className="w-full grid md:grid-cols-5 gap-4">
                    <Input label="Episode Name" bg value={epName} onChange={(e) => setEpName(e.target.value)} />
                    <Input
                        label="Episode Number"
                        type="number"
                        bg
                        value={epNumber}
                        onChange={(e) => setEpNumber(e.target.value)}
                    />
                    <Input
                        label="Runtime (min)"
                        type="number"
                        bg
                        value={epRuntime}
                        onChange={(e) => setEpRuntime(e.target.value)}
                    />
                    {useSeasons ? (
                        <div className="text-sm w-full">
                            <Select
                                label="Season"
                                options={seasonOptions}
                                name="epSeason"
                                register={{
                                    onChange: (e) => setEpSeasonId(e.target.value),
                                }}
                            />
                        </div>
                    ) : (
                        <div />
                    )}
                    <button
                        onClick={addEpisode}
                        className="bg-subMain text-white rounded flex items-center justify-center gap-2 px-4"
                    >
                        <FaPlus /> Add Episode
                    </button>
                </div>

                {/* Episode video (upload or link) */}
                <div className="w-full grid md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <p className="text-border font-semibold text-sm">Upload Episode Video</p>
                        <Uploader setImageUrl={setEpVideoUrl} />
                        {epVideoUrl ? (
                            <div className="w-full bg-main text-sm text-subMain py-3 border border-border rounded flex items-center justify-center">
                                Video selected
                            </div>
                        ) : null}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Input
                            label="Or paste Video URL"
                            placeholder="https://..."
                            type="text"
                            bg
                            value={epVideoLink}
                            onChange={(e) => setEpVideoLink(e.target.value)}
                        />
                        <p className="text-xs text-border">You can use upload or paste URL.</p>
                    </div>
                </div>


                {/* Episode list (editable) */}
                <div className="grid lg:grid-cols-2 gap-4">
                    {episodes.map((e) => (
                        <div key={e._localId} className="p-4 bg-main border border-border rounded space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold">Edit Episode</p>
                                <button
                                    onClick={() => removeEpisode(e._localId)}
                                    className="w-7 h-7 flex items-center justify-center rounded bg-dry border border-border text-red-400"
                                    title="Remove this episode"
                                >
                                    <MdDelete />
                                </button>
                            </div>

                            {/* Title */}
                            <Input
                                label="Episode Title"
                                type="text"
                                bg
                                value={e.title || ""}
                                onChange={(ev) => updateEpField(e._localId, "title", ev.target.value)}
                            />

                            {/* Number + Runtime */}
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label="Episode Number"
                                    type="number"
                                    bg
                                    value={e.episodeNumber ?? ""}
                                    onChange={(ev) =>
                                        updateEpField(e._localId, "episodeNumber", Number(ev.target.value))
                                    }
                                />
                                <Input
                                    label="Runtime (min)"
                                    type="number"
                                    bg
                                    value={e.runtime ?? ""}
                                    onChange={(ev) =>
                                        updateEpField(e._localId, "runtime", Number(ev.target.value))
                                    }
                                />
                            </div>

                            {/* Season selector (nếu dùng seasons) */}
                            {useSeasons && (
                                <div className="text-sm w-full">
                                    <Select
                                        label="Season"
                                        options={seasonOptions}
                                        name={`season_${e._localId}`}
                                        register={{
                                            onChange: (ev) => updateEpField(e._localId, "seasonLocalId", ev.target.value),
                                        }}
                                    />
                                    {/* Hiển thị giá trị hiện tại */}
                                    <p className="text-xs text-border mt-1">
                                        Current: {seasons.find((s) => s._localId === e.seasonLocalId)?.name || "—"}
                                    </p>
                                </div>
                            )}

                            {/* Video */}
                            <Input
                                label="Video URL"
                                type="text"
                                bg
                                value={e.video || ""}
                                onChange={(ev) => updateEpField(e._localId, "video", ev.target.value)}
                            />
                        </div>
                    ))}
                </div>


                <button
                    disabled={editLoading}
                    onClick={handleSubmit(onSubmit)}
                    className="bg-subMain w-full flex-rows gap-6 font-medium text-white py-4 rounded"
                >
                    {editLoading ? 'Updating...' : (<><ImUpload /> Update Series</>)}
                </button>
            </div>
        </SideBar>
    );
}

export default EditSeries;
