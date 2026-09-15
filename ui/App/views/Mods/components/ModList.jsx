import Mod from "./Mod";
import React from "react";


const ModList = ({mods, factorioVersion, updateMod, toggleMod, deleteMod, addUpdatableMod = null, disabled = false}) => {

    return (
        <table className="w-full">
            <thead>
            <tr className="text-left py-1">
                <th>名称</th>
                <th>启用</th>
                <th>兼容性</th>
                <th>模组版本</th>
                <th>Factorio 版本</th>
                <th/>
            </tr>
            </thead>
            <tbody>
            {
                factorioVersion !== null && mods.map(
                    (mod, i) =>
                        <Mod mod={mod} key={i}
                             updateMod={updateMod}
                             toggleMod={toggleMod}
                             deleteMod={deleteMod}
                             addUpdatableMod={addUpdatableMod}
                             factorioVersion={factorioVersion}
                             disabled={disabled}
                        />
                )
            }
            </tbody>
        </table>
    )
}

export default ModList;
