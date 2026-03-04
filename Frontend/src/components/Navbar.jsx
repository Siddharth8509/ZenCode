import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../authSlice";

export default function Navbar() {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            navigate("/login", {
                state: {
                    toast: { type: "success", message: "Logged out successfully." },
                },
            });
        } catch (error) {
            navigate("/login", {
                state: {
                    toast: {
                        type: "error",
                        message: error || "Logout failed.",
                    },
                },
            });
        }
    };

    return (
        <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-black/95 backdrop-blur-md border-b border-neutral-900">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                    ZenCode
                </Link>

                <div className="flex items-center gap-6">
                    <Link to="/problemset" className="text-neutral-300 hover:text-white font-medium transition-colors">
                        Problems
                    </Link>
                    {user && (
                        <Link to="/profile" className="text-neutral-300 hover:text-white font-medium transition-colors">
                            Profile
                        </Link>
                    )}

                    {user ? (
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
                                <div className="bg-neutral-700 text-neutral-content rounded-full w-10">
                                    <span className="text-lg">{user.firstname[0].toUpperCase()}</span>
                                </div>
                            </div>
                            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-neutral-800 rounded-box w-52 border border-neutral-700">
                                <li className="menu-title text-neutral-400">Hello, {user.firstname}</li>
                                <li><Link to="/profile" className="hover:bg-neutral-700 text-neutral-200">Profile</Link></li>
                                {user.role === 'admin' && (
                                    <li><Link to="/admin" className="hover:bg-neutral-700 text-neutral-200">Admin Panel</Link></li>
                                )}
                                <li><button onClick={handleLogout} className="text-red-400 hover:bg-red-900/20">Logout</button></li>
                            </ul>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="text-neutral-300 hover:text-white font-medium">Log in</Link>
                            <Link to="/signup" className="btn btn-sm bg-neutral-900 hover:bg-neutral-800 text-white border-none">Sign up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
