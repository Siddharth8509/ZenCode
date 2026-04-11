import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    CalculatorIcon, ReceiptPercentIcon, ScaleIcon, BanknotesIcon, CurrencyDollarIcon,
    BoltIcon, ArrowTrendingUpIcon, ChartBarIcon, LightBulbIcon, ArrowTrendingDownIcon,
    HeartIcon, CpuChipIcon, ChatBubbleOvalLeftEllipsisIcon, LanguageIcon, BookOpenIcon,
    ShieldCheckIcon, LockClosedIcon, XMarkIcon, EyeIcon, EyeSlashIcon
} from '@heroicons/react/24/outline';
import { ShieldCheckIcon as ShieldCheckSolid } from '@heroicons/react/24/solid';

const menuData = {
    Quantitative: {
        icon: <CalculatorIcon className="w-5 h-5" />,
        topics: [
            { name: "Percentage", icon: <ReceiptPercentIcon className="w-4 h-4" /> },
            { name: "Ratio and Proportion", icon: <ScaleIcon className="w-4 h-4" /> },
            { name: "Profit and Loss", icon: <BanknotesIcon className="w-4 h-4" /> },
            { name: "Simple Interest", icon: <CurrencyDollarIcon className="w-4 h-4" /> },
            { name: "Compound Interest", icon: <CurrencyDollarIcon className="w-4 h-4" /> },
            { name: "Time and Work", icon: <BoltIcon className="w-4 h-4" /> },
            { name: "Time and Distance", icon: <ArrowTrendingUpIcon className="w-4 h-4" /> },
            { name: "Averages", icon: <ChartBarIcon className="w-4 h-4" /> },
        ]
    },
    Logical: {
        icon: <LightBulbIcon className="w-5 h-5" />,
        topics: [
            { name: "Number Series", icon: <ArrowTrendingDownIcon className="w-4 h-4" /> },
            { name: "Blood Relations", icon: <HeartIcon className="w-4 h-4 text-red-500" /> },
            { name: "Syllogism", icon: <CpuChipIcon className="w-4 h-4" /> },
        ]
    },
    Verbal: {
        icon: <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />,
        topics: [
            { name: "Synonyms", icon: <LanguageIcon className="w-4 h-4" /> },
            { name: "Reading Comprehension", icon: <BookOpenIcon className="w-4 h-4" /> },
        ]
    }
};

const Sidebar = ({ onSelectTopic, activeTopic, isMobileOpen, setIsMobileOpen, selectedCompany, onSelectCompany }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [passcode, setPasscode] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const companies = ["TCS", "Infosys", "Wipro", "Cognizant", "Amazon", "Accenture"];

    const handleVerify = (e) => {
        e.preventDefault();
        const secretCode = import.meta.env.VITE_ADMIN_SECRET;
        if (passcode === secretCode) {
            sessionStorage.setItem("adminToken", "zencode_authenticated");
            toast.success("Access Granted!");
            setIsModalOpen(false);
            setPasscode("");
            setIsMobileOpen(false);
            navigate('/aptitude/admin');
        } else {
            toast.error("Incorrect Secret Key");
        }
    };

    const handleTopicClick = (topicName) => {
        onSelectTopic(topicName);
        if (window.innerWidth < 768) {
            setIsMobileOpen(false);
        }
    };

    const toggleCompany = (company) => {
        if (selectedCompany === company) {
            onSelectCompany("");
        } else {
            onSelectCompany(company);
        }
    };

    return (
        <>
            {isMobileOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden" onClick={() => setIsMobileOpen(false)} />
            )}

            <aside className={`fixed inset-y-0 left-0 z-[100] md:relative w-72 glass-panel border-r border-white/5 h-full flex flex-col transition-all duration-300 ${isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}`}>

                <div className="md:hidden flex justify-end p-4 flex-shrink-0">
                    <button onClick={() => setIsMobileOpen(false)} className="p-2 text-neutral-400 hover:bg-white/5 rounded-full"><XMarkIcon className="w-6 h-6" /></button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto no-scrollbar">

                    {/* COMPANY TOGGLES */}
                    <div className="mb-8">
                        <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-4">Target Company Filters</h3>
                        <div className="flex flex-wrap gap-2">
                            {companies.map((company) => (
                                <button
                                    key={company}
                                    onClick={() => toggleCompany(company)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                        selectedCompany === company 
                                        ? "bg-orange-500 text-black border-transparent shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
                                        : "bg-transparent text-neutral-400 border-white/10 hover:border-white/30 hover:text-white"
                                    }`}
                                >
                                    {company}
                                </button>
                            ))}
                        </div>
                        {selectedCompany && (
                            <p className="text-[10px] text-orange-400/80 font-medium mt-2">
                                Currently filtering topics for {selectedCompany} only.
                            </p>
                        )}
                    </div>

                    {/* TOPICS ACCORDION-LESS LAYOUT */}
                    <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-4">Topic Vault</h3>
                    
                    <div className="space-y-8">
                        {Object.keys(menuData).map((category) => (
                            <div key={category} className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                                    <span className="text-orange-400">{menuData[category].icon}</span>
                                    {category} Focus
                                </div>
                                <div className="pl-4 space-y-1 border-l-2 border-white/5">
                                    {menuData[category].topics.map((topic) => {
                                        const isActive = activeTopic === topic.name;
                                        return (
                                            <button
                                                key={topic.name}
                                                onClick={() => handleTopicClick(topic.name)}
                                                className={`w-full flex items-center gap-3 text-left p-2.5 rounded-xl text-[13px] font-medium transition-all ${
                                                    isActive 
                                                    ? "bg-gradient-to-r from-orange-500/20 to-transparent text-orange-400 border-l border-orange-500" 
                                                    : "text-neutral-400 hover:bg-white/5 hover:text-white border-l border-transparent"
                                                }`}
                                            >
                                                <span className={`${isActive ? "opacity-100" : "opacity-60"}`}>{topic.icon}</span>
                                                <span className={isActive ? "font-bold tracking-wide" : ""}>{topic.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

                {/* <div className="p-6 border-t border-white/5 flex-shrink-0 bg-black/40 backdrop-blur-sm">
                    <button onClick={() => setIsModalOpen(true)} className="w-full group flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/10 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-neutral-900 rounded-lg text-neutral-500 group-hover:text-amber-500 transition-colors border border-white/5">
                                <ShieldCheckIcon className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-neutral-400 group-hover:text-amber-500 transition-colors">Admin Portal</span>
                        </div>
                        <LockClosedIcon className="w-4 h-4 text-neutral-600 group-hover:text-amber-500/50" />
                    </button>
                </div> */}
            </aside>

            {isModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="glass-panel w-full max-w-sm rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden p-8 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl">
                                <ShieldCheckSolid className="w-6 h-6" />
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-neutral-500 hover:bg-white/10 hover:text-white rounded-full transition-colors">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">Security Check</h2>
                        <p className="text-sm text-neutral-400 mb-6">Enter secret key to access the admin dashboard.</p>
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="relative">
                                <input 
                                    autoFocus 
                                    type={showPassword ? "text" : "password"} 
                                    className="w-full p-4 pr-12 bg-neutral-900 rounded-xl border border-white/10 text-white font-bold outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder-neutral-600" 
                                    placeholder="Enter vault key..."
                                    value={passcode} 
                                    onChange={(e) => setPasscode(e.target.value)} 
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors">
                                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                            <button type="submit" className="w-full py-4 bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-black rounded-xl font-black shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all transform hover:-translate-y-0.5">
                                Authorize Access
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;