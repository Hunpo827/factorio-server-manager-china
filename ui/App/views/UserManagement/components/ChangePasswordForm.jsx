import {useForm} from "react-hook-form";
import React from "react";
import user from "../../../../api/resources/user";
import Button from "../../../components/Button";
import Label from "../../../components/Label";
import Input from "../../../components/Input";
import Error from "../../../components/Error";

const ChangePasswordForm = () => {
    const {register, handleSubmit, reset, formState: {errors}, watch} = useForm();

    const new_password = watch("new_password");

    const onSubmit = async (data) => {
        const res = await user.changePassword(data);
        if (res) {
            // Update successful
            window.flash("密码已修改", "green")
            reset();
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
                <Label htmlFor="old_password" text="当前密码"/>
                <Input register={register('old_password',{required: true})}
                       type="password"
                       placeholder="当前密码"
                />
                <Error error={errors.old_password} message="请填写当前密码"/>
            </div>
            <div className="mb-4">
                <Label htmlFor="new_password" text="新密码"/>
                <Input register={register('new_password',{required: true})}
                       type="password"
                       placeholder="新密码"
                />
                <Error error={errors.new_password} message="请填写新密码"/>
            </div>
            <div className="mb-4">
                <Label htmlFor="new_password_confirmation" text="确认新密码"/>
                <Input register={register('new_password_confirmation',{required: true, validate: value => value === new_password})}
                       type="password"
                       placeholder="确认新密码"
                />
                <Error error={errors.new_password_confirmation} message="请再次输入新密码"/>
            </div>
            <Button isSubmit={true} type="success">修改密码</Button>
        </form>
    )
}

export default ChangePasswordForm
