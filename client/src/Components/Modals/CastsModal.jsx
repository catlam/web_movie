import React, { useEffect, useState } from 'react';
import MainModal from './MainModal';
import { Input } from '../UsedInputs';
import Uploder from '../Uploder';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { addCastAction, updateCastAction } from '../../Redux/Actions/MoviesActions';
import toast from 'react-hot-toast';
// import { ImagepreviewCast } from '../ImagePreviewCast';
import { InlineError } from '../Notifications/Error';
import { Imagepreview } from '../ImagePreview';

function CastModal({ modalOpen, setModalOpen, cast }) {
    const dispatch = useDispatch();
    const [castImage, setCastImage] = useState("");
    const generateId = Math.floor(Math.random() * 100000000)
    const image = castImage ? castImage : cast?.image

    // validation cast
    const {
        register,
        handleSubmit,  
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(
            yup.object().shape({
                name: yup.string().required("Cast Name is required"),
            })
        )
    })

    // on submit
    const onSubmit = (data) => {
        if (cast) {
            // if cast is not null then update cast
            dispatch(
                updateCastAction({
                    ...data,
                    image: image,
                    id: cast.id,
                })
            );
            toast.success("Cast updated successfully")
        } else {
            // else create cast
            dispatch(
                addCastAction({
                    ...data,
                    image: image,
                    id: generateId,
                })
            )
            toast.success("Cast created successfully")
        }
        reset();
        setCastImage("");
        setModalOpen(false);
    }

    useEffect(() => {
        if (cast) {
            setValue("name", cast?.name)
        }
    }, [cast, setValue])

    return (
        <MainModal modalOpen={modalOpen} setModalOpen={setModalOpen}>
            <div className="inline-block border border-border w-full align-middle p-10 overflow-y-auto h-auto bg-main text-white rounded-2xl text-center">
                <h2 className="text-3xl font-bold">{cast ? "Update Cast" : "Create Cast"}</h2>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-6 text-left mt-6">
                    <div className="w-full">
                        <Input
                            label="Cast name"
                            placeholder="John Doe"
                            type="text"
                            name="name"
                            register={register("name")}
                            bg={true}
                        />
                        {errors.name && <InlineError text={errors.name.message} />}
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="text-border font-semibold text-sm">
                            Cast Image
                        </p>
                        <Uploder setImageUrl={setCastImage} />
                        <Imagepreview
                            image={image ? image : "/images/user.png"}
                            name="castImage"
                        />
                    </div>
                    <button
                        type="submit"
                        // onClick={() => setModalOpen(false)}
                        className="w-full flex-rows gap-4 py-3 hover:bg-dry text-lg bg-subMain rounded transition border-2 border-subMain text-white"
                    >
                        {cast ? "Update" : "Add"}

                    </button>
                </form>
            </div>
        </MainModal>
    );
}

export default CastModal;
