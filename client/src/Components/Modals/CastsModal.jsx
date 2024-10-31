import React from 'react';
import MainModal from './MainModal';
import { Input } from '../UsedInputs';
import Uploder from '../Uploder';

function CastModal({ modalOpen, setModalOpen, cast }) {
    return (
        <MainModal modalOpen={modalOpen} setModalOpen={setModalOpen}>
            <div className="inline-block border border-border w-full align-middle p-10 overflow-y-auto h-full bg-main text-white rounded-2xl text-center">
                <h2 className="text-3xl font-bold">{cast ? "Update Cast" : "Create Cast"}</h2>
                <form className="flex flex-col gap-6 text-left mt-6">
                    <Input
                        label="Cast Name"
                        placeholder={cast ? cast.fullName : "Alex John"}
                        type="text"
                        bg={false}
                    />
                    <div className="flex flex-col gap-2">
                        <p className="text-border font-semibold text-sm">
                            Cast Image
                        </p>
                        <Uploder />
                        <div className="w-32 h-32 p-2 bg-main border border-border rounded ">
                            <img
                                src={`/images/${cast ? cast.image : "user.jpg"}`}
                                alt={cast?.fullName}
                                className="w-full h-full object-cover rounded"
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setModalOpen(false)}
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
