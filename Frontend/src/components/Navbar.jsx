import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../authSlice";
import ZenCodeMark from "./ZenCodeMark";

const appLinks = [
  { label: "Problems", to: "/problemset" },
  { label: "Aptitude", to: "/aptitude" },
  { label: "Learning", to: "/learning" },
  { label: "Mock Interview", to: "/mock-interview" },
  { label: "AI Resume", to: "/ai-analyzer" },
  { label: "Resume Builder", to: "/resume-builder" },
];

const publicLinks = [
  { label: "Modules", href: "#modules" },
  { label: "Journey", href: "#roadmap" },
  { label: "Why ZenCode", href: "#ai-stack" },
];

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomepage = location.pathname === "/";

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

  const isActive = (to) =>
    location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-orange-400/10 bg-[rgba(7,7,7,0.88)] backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-3 text-white transition-opacity hover:opacity-90"
        >
          <ZenCodeMark className="h-10 w-10 shrink-0" />
          <div className="leading-none">
            <div className="text-[1.02rem] font-semibold tracking-tight">ZenCode</div>
            <div className="mt-1 hidden text-[10px] uppercase tracking-[0.26em] text-neutral-500 md:block">
              Interview Prep OS
            </div>
          </div>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
          <div className="flex items-center gap-1 rounded-full border border-orange-400/10 bg-white/[0.02] p-1">
            {user &&
              appLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${isActive(link.to)
                      ? "bg-orange-500/12 text-orange-100"
                      : "text-neutral-400 hover:text-orange-100"
                    }`}
                >
                  {link.label}
                </Link>
              ))}

            {!user &&
              (isHomepage ? (
                publicLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap text-neutral-400 transition-colors hover:text-orange-100"
                  >
                    {link.label}
                  </a>
                ))
              ) : (
                <Link
                  to="/"
                  className="rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap text-neutral-400 transition-colors hover:text-orange-100"
                >
                  Homepage
                </Link>
              ))}
          </div>
        </div>

        {user ? (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar border border-orange-400/10 bg-white/[0.04] hover:bg-orange-500/10"
            >
              {user.profilePic ? (
                <div className="w-10 overflow-hidden rounded-full border border-white/10">
                  <img src={user.profilePic} alt="Profile" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.08] text-sm font-semibold text-white">
                  {user.firstname[0].toUpperCase()}
                </div>
              )}
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content z-[1] mt-3 w-60 rounded-3xl border border-orange-400/10 bg-neutral-950 p-2 shadow-2xl"
            >
              <li className="menu-title text-neutral-400">Hello, {user.firstname}</li>
              <li>
                <Link to="/profile" className="rounded-2xl text-neutral-200 hover:bg-white/[0.06]">
                  Profile
                </Link>
              </li>
              {user.role === "admin" && (
                <>
                  <li>
                    <Link to="/admin" className="rounded-2xl text-neutral-200 hover:bg-white/[0.06]">
                      DSA Admin Panel
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/aptitude/admin"
                      className="rounded-2xl text-neutral-200 hover:bg-white/[0.06]"
                    >
                      Aptitude Admin Panel
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/learning/admin"
                      className="rounded-2xl text-neutral-200 hover:bg-white/[0.06]"
                    >
                      Learning Admin Panel
                    </Link>
                  </li>
                </>
              )}
              <li>
                <button
                  onClick={handleLogout}
                  className="rounded-2xl text-red-300 hover:bg-red-500/10"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/login"
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${isActive("/login")
                  ? "text-orange-100"
                  : "text-neutral-400 hover:text-orange-100"
                }`}
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-2 text-sm font-semibold text-white transition-colors hover:from-orange-400 hover:to-orange-300"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
