import Panel from "../components/Panel";
import React, {useEffect, useState} from "react";
import settingsResource from "../../api/resources/settings";
import Input from "../components/Input";
import Label from "../components/Label";
import Checkbox from "../components/Checkbox";
import InputPassword from "../components/InputPassword";
import Button from "../components/Button";
import {useForm} from "react-hook-form";

// Chinese names of the options of the factorio `server-settings.json`
const optionLabels = {
    name: "服务器名称",
    description: "服务器描述",
    tags: "标签",
    max_players: "最大玩家数",
    visibility: "可见性",
    username: "用户名",
    password: "密码",
    token: "令牌",
    game_password: "游戏密码",
    require_user_verification: "需要账号验证",
    allow_commands: "允许使用指令",
    autosave_interval: "自动存档间隔（分钟）",
    autosave_slots: "自动存档槽位",
    afk_autokick_interval: "挂机自动踢出（分钟）",
    auto_pause: "自动暂停",
    only_admins_can_pause_the_game: "仅管理员可暂停",
    autosave_only_on_server: "仅在服务器端自动存档",
    non_blocking_saving: "非阻塞存档",
    minimum_segment_size: "最小分片大小",
    minimum_segment_size_peer_count: "最小分片方人数阈值",
    maximum_segment_size: "最大分片大小",
    maximum_segment_size_peer_count: "最大分片方人数阈值",
    max_upload_in_kilobytes_per_second: "最大上传速度（KB/s）",
    max_upload_slots: "最大上传槽位数",
    ignore_player_limit_for_returning_players: "回访玩家不计入人数上限",
    admins: "管理员",
};

// Chinese descriptions of the options of the factorio `server-settings.json`.
// Options, that are not listed here, keep the description of the game itself.
const optionComments = {
    name: "显示在服务器列表中的服务器名称。",
    description: "显示在服务器列表中的服务器描述。",
    tags: "用于服务器列表筛选的标签，多个标签使用英文逗号分隔。",
    max_players: "允许同时在线的最多玩家数。",
    visibility: "服务器在官方列表和局域网中的可见性。",
    username: "在官方服务器列表中公开服务器时使用的 factorio.com 账号。",
    password: "上面账号的密码，仅在需要公开服务器时填写。",
    token: "factorio.com 令牌，可以代替上面的账号密码。",
    game_password: "玩家加入服务器时需要输入的密码，留空表示不需要密码。",
    require_user_verification: "只允许通过验证的 factorio.com 账号加入。",
    allow_commands: "谁可以使用控制台指令：true（所有人）、false（所有人都不行）、admins-only（仅管理员）。",
    autosave_interval: "自动存档的间隔分钟数，设为 0 表示关闭自动存档。",
    autosave_slots: "保留的自动存档数量。",
    afk_autokick_interval: "玩家多少分钟无操作后自动踢出，设为 0 表示不踢出。",
    auto_pause: "没有玩家在线时自动暂停游戏。",
    only_admins_can_pause_the_game: "只允许管理员暂停游戏。",
    autosave_only_on_server: "只有服务器进行自动存档。",
    non_blocking_saving: "存档时游戏不暂停，可能造成短暂卡顿。",
    minimum_segment_size: "网络数据分包的最小大小（字节）。",
    minimum_segment_size_peer_count: "使用最小分包大小的人数阈值。",
    maximum_segment_size: "网络数据分包的最大大小（字节）。",
    maximum_segment_size_peer_count: "使用最大分包大小的人数阈值。",
    max_upload_in_kilobytes_per_second: "服务器允许的最大上传速度（KB/s），0 表示不限制。",
    max_upload_slots: "同时允许上传的槽位数量。",
    ignore_player_limit_for_returning_players: "服务器人数已满时，仍允许之前加入过的玩家进入。",
    admins: "拥有管理员权限的玩家名列表，多个名字使用英文逗号分隔。",
};

// Chinese names for the sub-options of the visibility-setting
const visibilityLabels = {
    public: "公开（在官方服务器列表中显示）",
    lan: "局域网（在局域网中可见）",
};

const humanizeKey = key => key.replaceAll('_', ' ');

const ServerSettings = () => {

    const [settings, setSettings] = useState();
    const [addedOptions, setAddedOptions] = useState([]);

    const {register, handleSubmit} = useForm();

    const fetchSettings = async () => {
        const res = await settingsResource.server.list();
        setSettings(res?.settings ?? res);
        setAddedOptions(res?.added_options ?? []);
    };

    const saveServerSettings = data => {
        Object.keys(settings).forEach(key => {
            if (key.startsWith("_comment")) {
                return;
            }

            const originalValue = settings[key];

            if (Array.isArray(originalValue)) {
                // lists are edited as comma separated text
                const value = data[key];
                data[key] = typeof value === "string"
                    ? value.split(',').map(entry => entry.trim()).filter(entry => entry !== "")
                    : originalValue;
            } else if (typeof originalValue === "number") {
                const parsed = Number(data[key]);
                data[key] = isNaN(parsed) ? 0 : (Number.isInteger(originalValue) ? Math.round(parsed) : parsed);
            } else if (typeof originalValue === "boolean") {
                data[key] = data[key] === true;
            }
        });

        // keep everything, that is not rendered as a form-field
        // (comments, unknown/unsupported options of newer game versions)
        Object.keys(settings).forEach(key => {
            if (!(key in data)) {
                data[key] = settings[key];
            }
        });

        settingsResource.server.update(data)
            .then(() => {
                fetchSettings()
                    .then(() => window.flash("服务器设置已保存。", "green"))
            });
    }

    useEffect(() => {
        fetchSettings();
    }, []);

    const formTypeField = (name, value, label = null) => {
        switch (typeof value) {
            case "undefined":
                break;
            case "function":
                break;
            case "symbol":
                break;
            case "bigint":
                break;
            case "number":
                return (
                    <>
                        <Label htmlFor={name} text={label}/>
                        <Input type="number" name={name} register={register(name)} defaultValue={value}/>
                    </>
                )
            case "string":
                if (name.includes("password")) {
                    return (
                        <>
                            <Label htmlFor={name} text={label}/>
                            <InputPassword name={name} register={register(name)} defaultValue={value}/>
                        </>
                    )
                } else {
                    return (
                        <>
                            <Label htmlFor={name} text={label}/>
                            <Input name={name} register={register(name)} defaultValue={value}/>
                        </>
                    )
                }
            case "boolean":
                return (
                    <Checkbox checked={value} text={label} register={register(name)} name={name}/>
                )
            case "object":
                if (Array.isArray(value)) {
                    return (
                        <>
                            <Label htmlFor={name} text={label}/>
                            <Input name={name} register={register(name)} defaultValue={value}/>
                        </>
                    )
                } else if (name.includes("visibility")) {
                    return (
                        <>
                            <Label text={label || optionLabels[name] || humanizeKey(name)}/>
                            <div className="flex flex-wrap">
                                {Object.keys(value).map(key => <div className="mr-4" key={`visibility-${key}`}>
                                    <Checkbox checked={value[key]}
                                              register={register(`${name}.${key}`)}
                                              name={`${name}.${key}`}
                                              text={visibilityLabels[key] || key}/>
                                </div>)}
                            </div>
                        </>
                    )
                }
                break;
            default:
                return (
                    <>
                        <Label htmlFor={name} text={label}/>
                        <Input name={name} register={register(name)} defaultValue={value}/>
                    </>
                )
        }
    }

    return (
        <form className="mb-4" onSubmit={handleSubmit(saveServerSettings)}>
            <Panel
                title="服务器设置"
                content={
                    <>
                        <p className="text-sm italic mb-4">
                            这里是 Factorio 的 server-settings.json。标记为“新增”的选项是当前游戏版本新增、
                            而原有配置文件中缺失的选项，已经按游戏默认值自动补上，
                            保存后即会写入配置文件。
                        </p>
                        {settings && Object.keys(settings).map(key => {
                            if (key.startsWith("_comment_")) {
                                return null;
                            }

                            const value = settings[key]
                            const isNew = addedOptions.includes(key)
                            const label = (optionLabels[key] || humanizeKey(key)) + (isNew ? "（新增）" : "")
                            const comment = optionComments[key] || settings["_comment_" + key]

                            return (
                                <div className="mb-4" key={`wrapper-${key}`}>
                                    {formTypeField(key, value, label)}
                                    <p className="text-sm italic">{comment}</p>
                                </div>
                            )
                        })}
                    </>
                }
                actions={
                    <Button isSubmit={true} type="success">保存</Button>
                }
            />
        </form>
    )
}

export default ServerSettings;
