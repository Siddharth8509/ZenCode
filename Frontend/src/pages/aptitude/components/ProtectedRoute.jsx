import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    if (!isAuthenticated || user?.role !== "admin") {
        return <Navigate to="/aptitude/platform" replace />;
    }

    return children;
};

export default ProtectedRoute;
