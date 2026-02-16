import Navbar from "../components/Navbar";

export default function Leaderboard() {
    const users = [
        { rank: 1, name: "sarah_dev", solved: 1420, country: "US", initials: "SD" },
        { rank: 2, name: "david_chen", solved: 1350, country: "CN", initials: "DC" },
        { rank: 3, name: "alex_torvalds", solved: 1290, country: "DE", initials: "AT" },
        { rank: 4, name: "priya_s", solved: 1100, country: "IN", initials: "PS" },
        { rank: 5, name: "jordan_lee", solved: 1050, country: "GB", initials: "JL" },
        { rank: 6, name: "max_power", solved: 980, country: "CA", initials: "MP" },
        { rank: 7, name: "emma_w", solved: 920, country: "AU", initials: "EW" },
        { rank: 8, name: "lucas_silva", solved: 870, country: "BR", initials: "LS" },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/20">
            <Navbar />

            <div className="relative pt-28 pb-20 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-24 right-[-10%] w-[50%] h-[50%] bg-orange-400/30 blur-[140px] rounded-full" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-400/30 blur-[140px] rounded-full" />
                </div>

                <div className="relative z-10 container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-semibold">Leaderboard</h1>
                        <p className="text-slate-400 mt-4">Top problem solvers in the community.</p>
                    </div>

                    <div className="max-w-3xl mx-auto">
                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/10 text-slate-500 text-sm uppercase tracking-wider">
                                        <th className="py-4 pl-6">Rank</th>
                                        <th className="py-4">User</th>
                                        <th className="py-4 text-right pr-6">Solved</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr
                                            key={user.rank}
                                            className="border-b border-white/10 hover:bg-slate-950 transition-colors"
                                        >
                                            <td className="py-4 pl-6">
                                                <span
                                                    className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold ${user.rank === 1
                                                        ? "bg-amber-500/20 text-amber-400"
                                                        : user.rank === 2
                                                            ? "bg-slate-400/20 text-slate-300"
                                                            : user.rank === 3
                                                                ? "bg-orange-600/20 text-orange-400"
                                                                : "bg-slate-900 text-slate-500"
                                                        }`}
                                                >
                                                    {user.rank}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400/30 to-red-500/20 flex items-center justify-center text-sm font-bold">
                                                        {user.initials}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white">{user.name}</div>
                                                        <div className="text-xs text-slate-500">{user.country}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 pr-6 text-right">
                                                <span className="text-orange-400 font-mono font-semibold">{user.solved}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
