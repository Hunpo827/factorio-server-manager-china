import React, {useState} from "react";
import {useForm} from "react-hook-form";
import Input from "../../../../../components/Input";
import Label from "../../../../../components/Label";
import Button from "../../../../../components/Button";
import modsResource from "../../../../../../api/resources/mods";

const FactorioLogin = ({setIsFactorioAuthenticated}) => {

    const {register, handleSubmit} = useForm();
    const [isLoading, setIsLoading] = useState(false);

    const login = ({username, password}) => {
        setIsLoading(true);
        modsResource.portal.login(username, password)
            .then(res => {
                setIsFactorioAuthenticated(true)
            })
            .catch(() => window.flash("用户名（或邮箱）与密码不匹配，找不到对应账号。", "red"))
            .finally(() => setIsLoading(false));
    }

    return (
        <form onSubmit={handleSubmit(login)}>
            <div className="flex mb-4">
                <div className="w-1/2 mr-2">
                    <Label text="用户名" htmlFor="username"/>
                    <Input register={register('username',{required: true})}/>
                </div>
                <div className="w-1/2 ml-2">
                    <Label text="密码" htmlFor="password"/>
                    <Input type="password" register={register('password',{required: true})}/>
                </div>
            </div>
            <Button isSubmit={true} isLoading={isLoading}>登录</Button>
        </form>
    )
}

export default FactorioLogin;
