import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./routeConstants";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout";
import PrivateRoute from "./PrivateRoute";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import Collection from "../pages/Collection/Collection";

export const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path={ROUTES.LOGIN}
        element={
          isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Login />
        }
      />

      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.COLLECTION} element={<Collection />} />
        </Route>
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN}
            replace
          />
        }
      />
    </Routes>
  );
};

export default AppRoutes;
