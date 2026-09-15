import React, {useEffect} from 'react';
import {useForm} from "react-hook-form";
import user from "../../api/resources/user";
import Button from "../components/Button";
import {useLocation, useNavigate} from "react-router";
import Panel from "../components/Panel";
import Input from "../components/Input";
import Label from "../components/Label";
import {Flash} from "../components/Flash";
import Error from "../components/Error";

const Login = ({handleLogin}) => {
    const {register, handleSubmit, formState: { errors }} = useForm();
    const navigate = useNavigate();
    const location = useLocation();

    const onSubmit = async data => {
        try {
            const loginAttempt = await user.login(data)
            if (loginAttempt?.username) {
                await handleLogin(loginAttempt);
                navigate('/');
            }
        } catch (e) {
            console.log(e);
            window.flash("登录失败：用户名或密码错误。", "red");
            throw e;
        }
    };

    // on mount check if user is authenticated
    useEffect(() => {
        (async () => {
            const status = await user.status();
            if (status?.username) {
                await handleLogin(status);
                navigate(location?.state?.from || '/');
            }
        })();
    }, [])

    return (
        <div className="h-screen overflow-hidden flex items-center justify-center bg-black">
            <Panel
                title="登录"
                content={
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">
                            <Label text="用户名" htmlFor="username"/>
                            <Input register={register('username', {required: true})} placeholder="用户名"/>
                            <Error error={errors.username} message="请填写用户名"/>
                        </div>
                        <div className="mb-6">
                            <Label text="密码" htmlFor="password"/>
                            <Input
                                register={register('password',{required: true})}
                                type="password"
                                placeholder="******************"
                            />
                            <Error error={errors.password} message="请填写密码"/>
                        </div>
                        <div className="text-center">
                            <Button type="success" className="w-full" isSubmit={true}>登 录</Button>
                        </div>
                    </form>
                }
            />
            <Flash/>
        </div>
    );
};

export default Login;
