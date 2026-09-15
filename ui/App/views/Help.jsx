import Panel from "../components/Panel";
import React from "react";

const Help = () => {
    return (
        <Panel
            title="帮助"
            content={
                <>
                    <h1 className="text-xl text-dirty-white">Factorio 服务器管理器</h1>
                    <p className="mb-2">Factorio 服务器管理器（FSM）是一个开源项目，与 Factorio 游戏及 Wube Software 没有任何关联。</p>

                    <h2 className="text-dirty-white">问题反馈与帮助</h2>
                    <p className="mb-4">如需反馈问题或寻求帮助，请前往 <a className="text-blue hover:text-blue-light" target="_blank" href="https://github.com/OpenFactorioServerManager/factorio-server-manager/issues">GitHub 仓库</a> 提交 Issue。</p>

                    <h1 className="mb-1 text-xl text-dirty-white">相关资源</h1>
                    <p className="mb-2"><a className="text-blue hover:text-blue-light" target="_blank" href="https://wiki.factorio.com/Multiplayer">Factorio 官方 Wiki：多人游戏</a></p>
                </>
            }
        />
    )
}

export default Help;
