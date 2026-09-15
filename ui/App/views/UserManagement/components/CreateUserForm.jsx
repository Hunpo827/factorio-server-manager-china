import {useForm} from "react-hook-form";
import React from "react";
import user from "../../../../api/resources/user";
import Button from "../../../components/Button";
import Label from "../../../components/Label";
import Input from "../../../components/Input";
import Error from "../../../components/Error";

const CreateUserForm = ({updateUserList}) => {
    const roleValue = "admin";

    const {
        register,
        handleSubmit,
        formState: {errors},
        watch
    } = useForm({
        values: {
            role: roleValue,
        }
    });
    const password = watch('password');

    const onSubmit = async (data) => {
        const res = await user.add(data);
        if (res) {
            updateUserList()
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
                <Label htmlFor="username" text="用户名"/>
                <Input register={register('username', {required: true})}
                       type="text"
                       placeholder="用户名"
                />
                <Error error={errors.username} message="请填写用户名"/>
            </div>
            <div className="mb-4">
                <Label htmlFor="role" text="角色"/>
                <Input register={register('role', {required: true})}
                       value={roleValue}
                       disabled={true}
                       placeholder="角色"
                />
                <Error error={errors.role} message="请填写角色"/>
            </div>
            <div className="mb-4">
                <Label htmlFor="email" text="邮箱"/>
                <Input register={register('email', {required: true})}
                       type="email"
                       placeholder="邮箱"
                />
                <Error error={errors.email} message="请填写邮箱"/>
            </div>
            <div className="mb-4">
                <Label htmlFor="password" text="密码"/>
                <Input register={register('password', {required: true})}
                       type="password"
                       placeholder="密码"
                />
                <Error error={errors.password} message="请填写密码"/>
            </div>
            <div className="mb-4">
                <Label htmlFor="password_confirmation" text="确认密码"/>
                <Input register={register('password_confirmation', {
                            required: true,
                            validate: conformation => conformation === password
                        })}

                       type="password"
                       placeholder="确认密码"
                />
                <Error error={errors.password_confirmation}
                       message="请再次输入密码，且必须与密码一致"/>
            </div>
            <Button isSubmit={true} type="success">保存</Button>
        </form>
    )
}

export default CreateUserForm;
