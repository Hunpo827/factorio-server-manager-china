import Panel from "../../components/Panel";
import React, {useCallback, useEffect, useState} from "react";
import user from "../../../api/resources/user";
import CreateUserForm from "./components/CreateUserForm";
import ChangePasswordForm from "./components/ChangePasswordForm"
import {faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const UserManagement = () => {

    const [users, setUsers] = useState([]);

    const updateList = useCallback(async () => {
        const res = await user.list();
        if (res) {
            setUsers(res);
        }
    }, []);

    const deleteUser = useCallback(async (username) => {
        user.delete(username)
            .then(updateList);
    }, []);

    useEffect(() => {
        updateList()
    }, []);

    return (
        <>
            <Panel
                title="用户列表"
                content={
                    <table className="w-full">
                        <thead>
                        <tr className="text-left py-1">
                            <th>用户名</th>
                            <th>角色</th>
                            <th>邮箱</th>
                            <th>操作</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(user =>
                            <tr className="py-1" key={user.username}>
                                <td className="pr-4">{user.username}</td>
                                <td className="pr-4">{user.role}</td>
                                <td className="pr-4">{user.email}</td>
                                <td>
                                    <FontAwesomeIcon className="text-red cursor-pointer hover:text-red-light mr-2" onClick={() => deleteUser(user.username)} icon={faTrashAlt}/>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                }
                className="mb-4"
            />
            <Panel
                title="修改密码"
                content={<ChangePasswordForm/>}
                className="mb-4"
            />
            <Panel
                title="新建用户"
                content={<CreateUserForm updateUserList={updateList}/>}
                className="mb-4"
            />
        </>
    )
}

export default UserManagement;
