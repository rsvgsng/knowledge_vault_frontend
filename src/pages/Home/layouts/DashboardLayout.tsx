import React from 'react'
import { Home, Code, Bug, LogOut, LogsIcon } from 'lucide-react';
import logo from '../../../assets/logo.jpg'
import { Outlet, useNavigate } from 'react-router-dom';
import path from 'path';
function DashboardLayout() {
    const links = [
        // { name: 'Dashboard', path: '/', icon: <Home size={18} /> },
        { name: 'Repositories', path: '/repositories', icon: <Code size={18} /> },
        { name: 'Issues', path: '/issues', icon: <Bug size={18} /> },
        { name: "Logs", path: "/logs", icon: <LogsIcon size={18} /> },
    ];
    const navigate = useNavigate();
    return (
        <div className="flex h-screen w-full">
            {/* Sidebar */}
            <div className="fixed top-0 left-0 h-screen w-[200px] border-r flex flex-col items-center bg-white z-10">
                <img src={logo} className="w-35 h-15 mt-5" />
                <hr className="w-full border-t border-gray-200 mt-5" />
                <div className="flex flex-col gap-2 w-full p-3">
                    {links.map((link) => (
                        <div
                            key={link.name}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-200 p-2 rounded-md"
                            onClick={() => navigate(link.path)}
                        >
                            {link.icon}
                            <span>{link.name}</span>
                        </div>
                    ))}
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-200 p-2 rounded-md" onClick={() => {
                        const confirmation = window.confirm("Are you sure you want to logout?")
                        if (!confirmation) return
                        localStorage.clear()
                        window.location.reload()
                    }
                    }>
                        <LogOut size={18} />
                        <span>Logout</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-[200px] p-3">
                <Outlet />
            </div>
        </div>


    )
}

export default DashboardLayout