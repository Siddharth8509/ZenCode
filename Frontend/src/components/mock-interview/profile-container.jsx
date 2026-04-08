import { useSelector } from "react-redux";
import { Loader } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export const ProfileContainer = () => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="flex items-center">
        <Loader className="min-w-4 min-h-4 animate-spin text-emerald-500" />
      </div>);

  }

  return (
    <div className="flex items-center gap-6">
      {user ? (
        <Link to="/profile">
          <Button size="sm">{user.firstname || "Profile"}</Button>
        </Link>
      ) : (
        <Link to="/login">
          <Button size={"sm"}>Get Started</Button>
        </Link>
      )}
    </div>);

};
