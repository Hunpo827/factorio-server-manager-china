import React, {useState} from "react";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";
import Label from "../../../components/Label";
import Input from "../../../components/Input";
import {useForm} from "react-hook-form";
import modsResource from "../../../../api/resources/mods";

const CreateModPack = ({onSuccess}) => {

    const [isCreating, setIsCreating] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const {handleSubmit, register} = useForm();

    const createModPack = (data) => {
        setIsCreating(true);

        modsResource.packs
            .create(data.name)
            .then(onSuccess)
            .finally(() => {
                setIsCreating(false)
                setIsOpen(false);
            });
    }

    return <>
        <Button size="sm" onClick={() => setIsOpen(true)}>用当前已安装模组创建模组包</Button>
        <Modal title="创建模组包" isOpen={isOpen} content={
            <form onSubmit={handleSubmit(createModPack)}>
                <div className="mb-4">
                    <Label text="名称" htmlFor="name"/>
                    <Input register={register('name',{required: true})}/>
                </div>
                <Button size="sm" isLoading={isCreating} isSubmit={true}>创建</Button>
            </form>
        }
        actions={
            <Button onClick={() => setIsOpen(false)} size="sm" type="danger">取消</Button>
        }
        />
    </>
}

export default CreateModPack;
