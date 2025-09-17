import React, { useEffect, useState } from 'react';
import Layout from "../Layout/Layout";
import { Input } from '../Components/UsedInputs';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form'
import { LoginValidation } from '../Components/Validation/UserValidation';
import { yupResolver } from '@hookform/resolvers/yup'
import { InlineError } from '../Components/Notifications/Error';
import { loginAction } from '../Redux/Actions/userActions';
import { toast } from 'react-hot-toast'
import { FiEye, FiEyeOff } from 'react-icons/fi';

function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const { isLoading, isError, userInfo, isSuccess } = useSelector(
        (state) => state.userLogin
    );

    // validation user
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(LoginValidation)
    })

    // on submit
    const onSubmit = (data) => {
        dispatch(loginAction(data));
    }

    // userEffect 
    useEffect(() => {
        if (userInfo?.isAdmin) {
            navigate("/dashboard")
        }
        else if (userInfo) {
            navigate("/profile")
        }
        if (isSuccess) {
            toast.success(`Welcome back ${userInfo.fullName}`);
        }
        if (isError) {
            toast.error(isError);
            dispatch({ type: "USER_LOGIN_RESET" });
        }
    }, [userInfo, isSuccess, isError, navigate, dispatch]);

    return (
        <Layout>
            <div className="container mx-auto px-2 my-12 flex-colo">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-full max-w-md md:max-w-lg xl:max-w-xl gap-5 flex-colo p-14 bg-dry rounded-lg border border-border">
                    <img
                        src="/images/logo.png"
                        alt="logo"
                        className="w-full h-12 object-contain"
                    />
                    <div className="w-full">
                        <Input
                            label="Email"
                            placeholder="cineva@gmail.com"
                            type="email"
                            name="email"
                            register={register("email")}
                            bg={true}
                        />
                        {errors.email && <InlineError text={errors.email.message} />}
                    </div>

                    <div className="w-full">
                        <label className="block text-sm font-medium ">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                {...register("password")}
                                placeholder="*******"
                                className="w-full mt-2 p-4 pr-10 border border-border rounded bg-main text-sm"
                            />
                            <div
                                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                            </div>
                        </div>
                        <div className='text-border text-right mt-2'>
                            <label className='text-sm text-dryGray font-normal'>Do not remember password?</label>
                        </div>
                        {errors.password && <InlineError text={errors.password.message} />}
                    </div>




                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-subMain transition hover:bg-main flex-rows gap-4 text-white p-4 rounded-lg w-full"
                    >
                        {
                            // if loading show loading
                            isLoading ? (
                                "Loading..."
                            ) : (
                                <>
                                    <FiLogIn /> Sign In
                                </>
                            )
                        }

                    </button>
                    <p className="text-center text-border">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-dryGray font-semibold ml-2">
                            Sign Up
                        </Link>
                    </p>
                </form>
            </div>
        </Layout>
    )
}

export default Login