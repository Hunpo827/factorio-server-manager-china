import Panel from "../components/Panel";
import React, {useEffect, useState} from "react";
import settingsResource from "../../api/resources/settings";

// Chinese names of the sections of the factorio `config.ini`
const sectionLabels = {
    path: "路径",
    general: "常规",
    other: "其他",
    graphics: "图形",
    sound: "声音",
    network: "网络",
    logging: "日志",
    controls: "按键",
    debug: "调试",
};

// Chinese names of the options of the factorio `config.ini`
const optionLabels = {
    "read-data": "读取数据目录",
    "write-data": "写入数据目录",
    "auto-detect": "自动检测",
    locale: "语言",
    verbose: "详细日志",
    "log-rotation": "日志轮转数量",
    "log-rotation-size": "日志轮转大小",
    "disable-blueprint-storage": "禁用蓝图库",
    "max-threads": "最大线程数",
    "fullscreen": "全屏",
    "video-memory-usage": "显存占用",
    "cache-sprite-atlas": "缓存精灵图集",
    "compress-colors": "压缩调色板",
    "max-texture-size": "最大贴图尺寸",
    "screenshot-quality": "截图质量",
    "output-quality": "音频输出质量",
    "max-sounds": "最大音效数",
    "intro-music": "启动音乐",
    "proxy": "代理",
    "proxy-username": "代理用户名",
    "proxy-password": "代理密码",
    "log-verbose-rotations": "详细日志轮转数量",
    "console-log": "控制台日志",
};

const humanizeKey = key => key.replaceAll('_', ' ').replaceAll('-', ' ');

const GameSettings = () => {

    const [settingsCategories, setSettingsCategories] = useState();

    const fetchSettings = async () => {
        const res = await settingsResource.game.list();
        setSettingsCategories(res);
    }

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <Panel
            className="mb-4"
            title="游戏设置"
            content={
                <>
                    <p className="text-sm italic mb-4">
                        这里是 Factorio 的 config.ini（服务器运行时使用的配置）。
                        该文件由游戏自身维护，如需修改请直接编辑服务器上的 config/config.ini。
                    </p>
                    {settingsCategories && Object.keys(settingsCategories).map(key => {
                        const settings = settingsCategories[key];
                        return (
                            <div key={key}>
                                <h1 className="mb-1 text-lg text-dirty-white">
                                    {sectionLabels[key] || humanizeKey(key)}
                                    <span className="text-sm opacity-75"> [{key}]</span>
                                </h1>
                                <table key={key} className="w-full mb-2">
                                    <tbody>
                                    {settings && (Object.keys(settings).length > 0 && Object.keys(settings).map(key => {
                                        return (
                                            <tr className="py-1" key={key}>
                                                <td className="w-1/3 pr-4">
                                                    {optionLabels[key] || humanizeKey(key)}
                                                    <span className="text-sm opacity-75"> ({key})</span>
                                                </td>
                                                <td className="w-2/3 pr-4">{settings[key]}</td>
                                            </tr>
                                        )
                                    })) || <tr>
                                        <td colSpan={2}>--</td>
                                    </tr>}
                                    </tbody>
                                </table>
                            </div>
                        )
                    })}
                </>
            }
        />
    )
}

export default GameSettings;
