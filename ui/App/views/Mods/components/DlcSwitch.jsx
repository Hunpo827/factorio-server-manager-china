import Panel from "../../../components/Panel";
import React, {useEffect, useState} from "react";
import modsResource from "../../../../api/resources/mods";
import ConfirmDialog from "../../../components/ConfirmDialog";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faSpinner, faTimes, faToggleOff, faToggleOn} from "@fortawesome/free-solid-svg-icons";

const DlcSwitch = ({disabled = false}) => {

    const [dlc, setDlc] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const fetchDlc = () => modsResource.dlc.status().then(setDlc);

    useEffect(() => {
        fetchDlc();
    }, []);

    const applyDlc = enabled => {
        setIsLoading(true);
        return modsResource.dlc.set(enabled)
            .then(res => {
                setDlc(res);

                if (enabled && res.skipped?.length > 0) {
                    window.flash(`未安装官方模组 ${res.skipped.join('、')}，已跳过。请确认服务器已安装《太空时代》DLC。`, "red");
                } else {
                    window.flash(enabled
                        ? "已开启《太空时代》DLC，重新启动服务器后生效。"
                        : "已关闭《太空时代》DLC，重新启动服务器后生效。", "green");
                }
            })
            .finally(() => setIsLoading(false));
    };

    const toggle = () => {
        if (dlc.enabled) {
            setIsConfirmOpen(true);
        } else {
            applyDlc(true);
        }
    };

    const installedMods = dlc?.mods?.filter(mod => mod.installed) ?? [];
    const canToggle = !disabled && !isLoading && dlc?.available;

    return (
        <>
            <Panel
                title="游戏 DLC（官方模组）"
                className="mb-6"
                content={
                    dlc === null
                        ? <div className="text-center py-4"><FontAwesomeIcon icon={faSpinner} spin={true}/></div>
                        : <>
                        <div className="flex items-center mb-4">
                            <div className="mr-3 text-lg">
                                {
                                    dlc.enabled
                                        ? <FontAwesomeIcon
                                            className={canToggle ? "cursor-pointer text-green hover:text-green-light" : "text-green"}
                                            icon={faToggleOn}
                                            onClick={() => canToggle && toggle()}/>
                                        : <FontAwesomeIcon
                                            className={canToggle ? "cursor-pointer text-gray-light hover:text-orange" : "text-gray-light"}
                                            icon={faToggleOff}
                                            onClick={() => canToggle && toggle()}/>
                                }
                            </div>
                            <div>
                                <div className="font-bold text-dirty-white">
                                    {dlc.enabled ? "服务器已启用《太空时代》DLC" : "服务器未启用《太空时代》DLC"}
                                </div>
                                <div className="text-sm">
                                    关闭后服务器将以原版（不含 DLC 内容）运行，重新启动服务器后生效。
                                </div>
                            </div>
                        </div>

                        <table className="w-full">
                            <thead>
                            <tr className="text-left py-1">
                                <th>官方模组</th>
                                <th>版本</th>
                                <th>安装位置</th>
                                <th>启用状态</th>
                            </tr>
                            </thead>
                            <tbody>
                            {(dlc.mods ?? []).map(mod =>
                                <tr className="py-1" key={mod.name}>
                                    <td className="pr-4">{mod.title} <span className="text-sm opacity-75">({mod.name})</span></td>
                                    <td className="pr-4">{mod.installed ? mod.version : '—'}</td>
                                    <td className="pr-4">{mod.installed ? (mod.location === "data" ? "游戏自带" : "mods 目录") : '—'}</td>
                                    <td className="pr-4">
                                        {mod.installed
                                            ? (mod.enabled
                                                ? <FontAwesomeIcon className="text-green" icon={faCheck}/>
                                                : <FontAwesomeIcon className="text-red" icon={faTimes}/>)
                                            : <span className="text-red">未安装</span>}
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>

                        {!dlc.available &&
                            <p className="text-red mt-4">
                                未检测到官方 DLC 模组，说明当前服务器安装的可能是不含《太空时代》DLC 的版本。
                            </p>
                        }

                        {dlc.available && installedMods.length < 3 &&
                            <p className="text-sm italic mt-4">
                                只检测到 {installedMods.length} 个官方模组，正常情况下应为 3 个（space-age、quality、elevated-rails）。
                            </p>
                        }

                        <p className="text-sm italic mt-4">
                            注意：使用《太空时代》创建的存档无法在没有 DLC 的服务器上加载，
                            关闭 DLC 前请确认存档不再需要它。
                        </p>
                        </>
                }
                actions={
                    dlc !== null &&
                    <div className="text-sm">
                        {
                            disabled
                                ? "服务器运行中，无法切换 DLC，请先停止服务器。"
                                : <button className="underline hover:text-orange" onClick={fetchDlc}>刷新状态</button>
                        }
                    </div>
                }
            />
            <ConfirmDialog
                title="关闭《太空时代》DLC"
                content="关闭后，由《太空时代》创建的存档将无法启动服务器。确定要关闭吗？"
                isOpen={isConfirmOpen}
                close={() => setIsConfirmOpen(false)}
                onSuccess={() => applyDlc(false)}
            />
        </>
    )
}

export default DlcSwitch;
