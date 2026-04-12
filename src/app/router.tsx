import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/shared/protected-route";
import LoginPage from "@/pages/login-page";
import RegisterPage from "@/pages/register-page";
import ProjectsPage from "@/pages/projects-page";
import ProjectDetailPage from "@/pages/project-detail-page";
import NotFoundPage from "@/pages/not-found-page";
import { getStoredToken } from "@/features/auth/auth-storage";

function RootRedirect() {
  const token = getStoredToken();
  return <Navigate to={token ? "/projects" : "/login"} replace />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            path: "/projects",
            element: <ProjectsPage />,
          },
          {
            path: "/projects/:projectId",
            element: <ProjectDetailPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);