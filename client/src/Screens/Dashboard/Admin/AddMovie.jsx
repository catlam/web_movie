import React, { useEffect, useState } from 'react';
import { Input, Message, Select } from '../../../Components/UsedInputs';
import SideBar from '../SideBar';
import Uploder from '../../../Components/Uploder';
import { CategoriesData } from '../../../Data/CategoriesData';
import { UsersData } from '../../../Data/MovieData';
import { MdDelete } from 'react-icons/md';
import { FaEdit } from 'react-icons/fa';
import { ImUpload } from 'react-icons/im'
import CastModal from '../../../Components/Modals/CastsModal';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { movieValidation } from '../../../Components/Validation/MovieValidation';
import { removeCastAction } from '../../../Redux/Actions/MoviesActions';
import toast from 'react-hot-toast';
import { InlineError } from '../../../Components/Notifications/Error';

function AddMovie() {
    const [modalOpen, setModalOpen] = useState(false);
    const [cast, setCast] = useState(null);
    const [imageWithTitle, setImageWithoutTitle] = useState("");
    const [imageTitle, setImageTitle] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // use selector
    const { categories } = useSelector((state) => state.categoryGetAll);
    const { isLoading, isError, isSuccess } = useSelector(
        (state) => state.createMovie
    );
    const { casts } = useSelector((state) => state.casts)

    // validation movie
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(movieValidation)
    })

    // on submit
    const onSubmit = (data) => {
        // dispatch(loginAction(data));
        console.log(data)
    }

    // delete cast handler
    const deleteCastHandler = (id) => {
        dispatch(removeCastAction(id));
        toast.success("Cast deleted successfully")
    }




    useEffect(() => {
        // if modal is false then reset cast
        if (modalOpen === false) {
            setCast();
        }
        // if its success then reset form and navigate to addMovie
        if (isSuccess) {
            reset({
                name: "",
                time: "",
                language: "",
                year: "",
                category: "",
                desc: "",
            })
            setImageTitle("");
            setImageWithoutTitle("");
            setVideoUrl("");
            dispatch({ type: "CREATE_MOVIE_RESET" });
            navigate("/addMovie");
        }
        // if error then show error
        if (isError) {
            toast.error("Something went wrong");
            dispatch({ type: "CREATE_MOVIE_RESET" });
        }
    }, [modalOpen, isSuccess, isError, dispatch, reset, navigate]);


    return (
        <SideBar>
            <CastModal modalOpen={modalOpen} setModalOpen={setModalOpen} cast={cast} />
            <div className="flex flex-col gap-6">
                <h2 className="text-xl font-bold">Create Movie</h2>
                <div className="w-full grid md:grid-cols-2 gap-6">

                    <div className="w-full">
                        <Input
                            label="Movie Title"
                            placeholder="Harry Potter"
                            type="text"
                            bg={true}
                            name="name"
                            register={register("name")}
                        />
                        {errors.name && <InlineError text={errors.name.message} />}
                    </div>
                    <div className="w-full">
                        <Input
                            label="Hours"
                            placeholder="2hr"
                            type="text"
                            bg={true}
                            name="time"
                            register={register("time")}
                        />
                        {errors.time && <InlineError text={errors.time.message} />}
                    </div>
                </div>
                <div className="w-full grid md:grid-cols-2 gap-6">
                    <Input
                        label="Language"
                        placeholder="English"
                        type="text"
                        bg={true}
                    />
                    <Input
                        label="Year of Release"
                        placeholder="2016"
                        type="number"
                        bg={true}
                    />
                </div>
                {/* IMAGES */}
                <div className="w-full grid md:grid-cols-2 gap-6">
                    {/* img without title */}
                    <div className="flex flex-col gap-2">
                        <p className="text-border font-semibold text-sm">
                            Image without title
                        </p>
                        <Uploder />
                        <div className="w-32 h-32 p-2 bg-main border border-border rounded ">
                            <img
                                src="/images/movies/14a.jpg"
                                alt=""
                                className="w-full h-full object-cover rounded"
                            />
                        </div>
                    </div>
                    {/* img with title */}
                    <div className="flex flex-col gap-2">
                        <p className="text-border font-semibold text-sm">
                            Image with title
                        </p>
                        <Uploder />
                        <div className="w-32 h-32 p-2 bg-main border border-border rounded ">
                            <img
                                src="/images/movies/14b.jpg"
                                alt=""
                                className="w-full h-full object-cover rounded"
                            />
                        </div>
                    </div>
                </div>
                {/* DESCRIPTION */}
                <Message
                    label="Movie Description"
                    placeholder="Make it short and sweet"
                />
                {/* CAtegory */}
                <div className="text-sm w-full">
                    <Select label="Movie Category" options={CategoriesData} />
                </div>
                {/* VIDEO */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-border font-semibold text-sm">
                        Movie Video
                    </label>
                    <Input
                        placeholder="ID of Video"
                        type="text"
                        bg={true}
                    />
                </div>
                {/* CAST */}
                <div className="w-full grid lg:grid-cols-2 gap-6 items-start">
                    <button
                        onClick={() => setModalOpen(true)}
                        className="w-full py-4 bg-main border border-subMain border-dashed text-white rounded">
                        Add Cast
                    </button>
                    <div className="grid 2xl:grid-cols-4 lg:grid-cols-3 sm:grid-col4 grid-cols-2 gap-4">
                        {UsersData.map((user, i) => (
                            <div key={i} className="p-2 italic text-xs text-text rounded flex-colo bg-main border border-border ">
                                <img
                                    src={`/images/${user.image ? user.image : "user.jpg"}`}
                                    alt={user.fullName}
                                    className="w-full h-24 object-cover rounded mb-2"
                                />
                                <p>{user.fullName}</p>
                                <div className="flex-rows mt-2 w-full gap-2">
                                    <button className="w-6 h-6 flex-colo bg-dry border border-border text-subMain rounded">
                                        <MdDelete />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setCast(user);
                                            setModalOpen(true);
                                        }}
                                        className="w-6 h-6 flex-colo bg-dry border border-border text-green-60 rounded">
                                        <FaEdit />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* SUBMIT*/}
                <button className="bg-subMain w-full flex-rows gap-6 font-medium text-white py-4 rounded">
                    <ImUpload /> Publish Movie
                </button>
            </div>
        </SideBar>
    )
}

export default AddMovie;