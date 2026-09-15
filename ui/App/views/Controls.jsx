import React, {useEffect, useState} from "react";
import Panel from "../components/Panel";
import Button from "../components/Button";
import server from "../../api/resources/server";
import savesResource from "../../api/resources/saves";
import {useForm} from "react-hook-form";
import Select from "../components/Select";
import Input from "../components/Input";
import Error from "../components/Error";

const Controls = ({serverStatus}) => {

    const factorioVersion = serverStatus.fac_version ? serverStatus.fac_version : '未知';
    const [saves, setSaves] = useState([]);
    const [isDisabled, setIsDisabled] = useState(true);
    const [isStopping, setIsStopping] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [isKilling, setIsKilling] = useState(false);

    const { handleSubmit, reset, register, formState: {errors} } = useForm();

    const startServer = async (data) => {
        setIsStarting(true);
        await server.start(data.ip, parseInt(data.port), data.save);
    }

    const stopServer = async () => {
        setIsStopping(true);
        await server.stop();
    }

    const killServer = async () => {
        setIsKilling(true);
        await server.kill();
    }

    useEffect(() => {
        savesResource.list(true)
            .then(res => {
                setSaves(res);
                if (res.length > 0) {
                    setIsDisabled(undefined);
                }
                reset();
            });
    }, [])

    return (
        <form onSubmit={handleSubmit(startServer)}>
        <Panel
            title="服务器状态"
            content={
                <div className="lg:flex">
                    { serverStatus.running
                        ? <>
                            <div className="lg:w-1/5 mb-2">
                                <div className="font-bold">状态</div>
                                <div>{serverStatus.running ? '运行中' : '已停止'}</div>
                            </div>
                            <div className="lg:w-1/5 mb-2">
                                <div className="font-bold">IP 地址</div>
                                <div>{serverStatus.bindip}</div>
                            </div>
                            <div className="lg:w-1/5 mb-2">
                                <div className="font-bold">端口</div>
                                <div>{serverStatus.port}</div>
                            </div>
                            <div className="lg:w-1/5 mb-2">
                                <div className="font-bold">Factorio 版本</div>
                                <div>{factorioVersion}</div>
                            </div>
                            <div className="lg:w-1/5 mb-2">
                                <div className="font-bold">存档</div>
                                <div>{serverStatus.savefile}</div>
                            </div>
                        </>
                        : <>
                            <div className="lg:w-1/5 mb-2">
                                <div className="font-bold">状态</div>
                                <div>{serverStatus.running ? '运行中' : '已停止'}</div>
                            </div>
                            <div className="lg:w-1/5 mb-2 mr-0 lg:mr-4">
                                <div className="font-bold">IP 地址</div>
                                <Input
                                    defaultValue={"0.0.0.0"}
                                    disabled={isDisabled}
                                    register={register('ip',{required: true, pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/})}
                                />
                                <Error error={errors.ip} message="IP 地址必填，且必须是合法的 IPv4 地址。"/>
                            </div>
                            <div className="lg:w-1/5 mb-2 mr-0 lg:mr-4">
                                <div className="font-bold">端口</div>
                                <Input
                                    type="number"
                                    min={1}
                                    max={65535}
                                    defaultValue={"34197"}
                                    disabled={isDisabled}
                                    register={register('port',{required: true, min: 1, max: 65535})}
                                />
                                <Error error={errors.port} message="端口必填，取值范围为 1-65535"/>
                            </div>
                            <div className="lg:w-1/5 mb-2 mr-0 lg:mr-4">
                                <div className="font-bold">Factorio 版本</div>
                                <div>{factorioVersion}</div>
                            </div>
                            <div className="lg:w-1/5 mb-2">
                                <div className="font-bold">存档</div>
                                <div className="relative">
                                    <Select
                                        register={register('save',{required: true})}
                                        defaultValue={saves.find((save) => save.name.startsWith('Load Latest'))?.name}
                                        disabled={isDisabled}
                                        options={saves.map(save => new Object({
                                            value: save.name,
                                            name: save.name
                                        }))}
                                    />
                                    <Error error={errors.save} message="请选择一个有效的存档。"/>
                                </div>
                            </div>
                        </>
                    }
                </div>
            }
            actions={
                <div className="md:flex">
                    {serverStatus.running
                        ? <>
                            <Button onClick={stopServer} isLoading={isStopping} isDisabled={isKilling} size="sm" className="w-full md:w-auto mb-2 md:mb-0 md:mr-2" type="default">保存并停止服务器</Button>
                            <Button onClick={killServer} isLoading={isKilling} isDisabled={isStopping} size="sm" type="danger" className="w-full md:w-auto">强制结束服务器</Button>
                        </>
                        : <Button isSubmit={true} isDisabled={isDisabled} isLoading={isStarting} size="sm" type="success" className="w-full md:w-auto">启动服务器</Button>
                    }
                </div>
            }
        />
        </form>
    )
};

export default Controls;
