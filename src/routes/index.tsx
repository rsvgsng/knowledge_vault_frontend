import LoginForm from "@/pages/Auth/Login";
import SignupForm from "@/pages/Auth/Signup";
import DashboardLayout from "@/pages/Home/layouts/DashboardLayout";
import Issues from "@/pages/Issues/Issues";
import IssueSingle from "@/pages/Issues/IssueSingle";
import IssueVerySingle from "@/pages/Issues/IssueVerySingle";
import Logsx from "@/pages/Logsx/Logsx";
import Repo from "@/pages/Repo/Repo";
import RepoPage from "@/pages/Repo/RepoPage";
import { createBrowserRouter, Navigate } from "react-router-dom";


const isLoggedIn = () => {
    const token = localStorage.getItem("token")
    return !!token
}

const router = createBrowserRouter([
    {
        path: '/login',
        element: isLoggedIn() ? <Navigate to="/" /> : <LoginForm />
    },
    {
        path: '/signup',
        element: isLoggedIn() ? <Navigate to="/" /> : <SignupForm />
    },
    // {
    //     path: '/',
    //     element: isLoggedIn() ? <DashboardLayout /> : <Navigate to="/login" />,
    //     children: [
    //         {
    //             path: '',
    //             element: <Dashboard />
    //         }
    //     ]

    // },
    {
        path: '/repositories',
        element: isLoggedIn() ? <DashboardLayout /> : <Navigate to="/login" />,
        children: [
            {
                path: '',
                element: <Repo />
            },
            {
                path: ':id',
                element: <RepoPage />
            },
            {
                path: ':id/:file',
                element: <h1>File</h1>
            }
        ]
    },
    {
        path: '/issues',
        element: isLoggedIn() ? <DashboardLayout /> : <Navigate to="/login" />,
        children: [
            {
                path: '',
                element: <Issues />
            },
            {
                path: ':id',
                element: <IssueSingle />
            },
            {
                path: ':id/:issueId',
                element: <IssueVerySingle />
            }
        ]
    },
    {
        path: '/logs',
        element: isLoggedIn() ? <DashboardLayout /> : <Navigate to="/login" />,
        children: [
            {
                path: '',
                element: <Logsx />
            }
        ]
    },
    {
        path: "*",
        element: <Navigate to="/repositories" />
    }
])

export default router