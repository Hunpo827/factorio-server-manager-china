import React, {useEffect, useState} from "react";
import {NavLink, Outlet} from "react-router-dom";
import Button from "./Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars} from "@fortawesome/free-solid-svg-icons";
import {Flash} from "./Flash";

const Layout = ({handleLogout, serverStatus}) => {

    const [isNavCollapsed, setIsNavCollapsed] = useState(true);

    const Status = ({info}) => {

        let text = '未知';
        let color = 'gray-light';

        if (info && info.running) {
            text = '运行中';
            color = 'green';
        } else if (info && !info.running) {
            text = '已停止';
            color = 'red';
        }

        return (
            <div className={`bg-${color} accentuated rounded px-2 py-1 text-black`}>{text}</div>
        )
    }

    const Link = ({children, to, last}) => {
        return (
            <NavLink
                onClick={() => setIsNavCollapsed(true)}
                end
                to={to}
                className={({isActive}) => {
                    return [
                        isActive ? "bg-orange" : "",
                        `hover:glow-orange accentuated bg-gray-light hover:bg-orange text-black font-bold py-2 px-4 w-full block${last ? '' : ' mb-1'}`,
                    ].join(" ")
                }}
            >{children}</NavLink>)
    }

    return (
        <>
            {/*Sidebar*/}
            <div className="w-full md:w-88 md:fixed md:top-0 md:left-0 bg-gray-dark md:h-screen overflow-y-auto">
                <div className="py-4 px-2 accentuated">
                    <div className="mx-4 justify-between flex text-center">
                        <span className="text-dirty-white text-xl">Factorio 服务器管理器</span>
                        <button
                            className="md:hidden cursor-pointer text-white hover:text-dirty-white"
                            onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                        >
                            <FontAwesomeIcon icon={faBars}/>
                        </button>
                    </div>
                </div>
                <div className={isNavCollapsed ? "hidden md:block" : "block"}>
                    <div className="py-4 px-2 accentuated">
                        <h1 className="text-dirty-white text-lg mb-2 mx-4">服务器状态</h1>
                        <div className="mx-4 mb-4 text-center">
                            <Status info={serverStatus}/>
                        </div>
                    </div>
                    <div className="py-4 px-2 accentuated">
                        <h1 className="text-dirty-white text-lg mb-2 mx-4">服务器管理</h1>
                        <div className="text-white text-center rounded-sm bg-black shadow-inner mx-4 p-1">
                            <Link to="/">服务器控制</Link>
                            <Link to="/saves">存档管理</Link>
                            <Link to="/mods">模组管理</Link>
                            <Link to="/server-settings">服务器设置</Link>
                            <Link to="/game-settings">游戏设置</Link>
                            <Link to="/console">控制台</Link>
                            <Link to="/logs" last={true}>日志</Link>
                        </div>
                    </div>
                    <div className="py-4 px-2 accentuated">
                        <h1 className="text-dirty-white text-lg mb-2 mx-4">管理器管理</h1>
                        <div className="text-white text-center rounded-sm bg-black shadow-inner mx-4 p-1">
                            <Link to="/user-management">用户管理</Link>
                            <Link to="/help" last={true}>帮助</Link>
                        </div>
                    </div>
                    <div className="py-4 px-2 accentuated">
                        <div className="text-white text-center rounded-sm bg-black shadow-inner mx-4 p-1">
                            <Button type="danger" className="w-full" onClick={handleLogout}>退出登录</Button>
                        </div>
                    </div>
                    <div className="accentuated-t accentuated-x md:block hidden"/>
                </div>
            </div>

            {/*Main*/}
            <div className="md:ml-88 min-h-screen">
                <div className="container md:mx-auto pt-16 md:px-6">
                    <Outlet />
                    <Flash/>
                </div>
            </div>
        </>
    );
}

export default Layout;
