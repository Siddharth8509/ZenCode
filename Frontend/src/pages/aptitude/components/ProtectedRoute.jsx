import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = sessionStorage.getItem("adminToken") === "zencode_authenticated";

    useEffect(() => {
        return () => {
            console.log("Cleaning up session...");
            sessionStorage.removeItem("adminToken");
        };
    }, []);

    if (!isAuthenticated) {
        return <Navigate to="/aptitude/platform" replace />;
    }

    return children;
};

export default ProtectedRoute;
