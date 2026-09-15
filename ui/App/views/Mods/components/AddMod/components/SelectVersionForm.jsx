import React from "react";
import Modal from "../../../../../components/Modal";
import Button from "../../../../../components/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCloudDownloadAlt} from "@fortawesome/free-solid-svg-icons/faCloudDownloadAlt";
import {faCheck} from "@fortawesome/free-solid-svg-icons/faCheck";
import {faTimes} from "@fortawesome/free-solid-svg-icons/faTimes";

const SelectVersionForm = ({releases, isOpen, close, install}) => {

    const download = release => {
        install(release)
        close()
    }

    return (
        <Modal
            isOpen={isOpen}
            title="选择版本"
            content={
                <div className="h-64 overflow-y-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="text-left py-1">
                            <th>版本</th>
                            <th>兼容性</th>
                            <th>操作</th>
                        </tr>
                        </thead>
                        <tbody>
                        {[...releases].reverse().map((release, i) =>
                            <tr className="py-2 md:py-1" key={i}>
                                <td className="pr-4">{release.version}</td>
                                <td className="pr-4">{release.compatibility
                                    ? <FontAwesomeIcon  className="text-green" icon={faCheck}/>
                                    : <FontAwesomeIcon  className="text-red" icon={faTimes}/>
                                }</td>
                                <td>
                                    { release.compatibility && <FontAwesomeIcon className="cursor-pointer" onClick={() => download(release)} icon={faCloudDownloadAlt}/> }
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            }
            actions={
                <Button onClick={close} size="sm" type="danger">取消</Button>
            }
        />
    )
}

export default SelectVersionForm;
