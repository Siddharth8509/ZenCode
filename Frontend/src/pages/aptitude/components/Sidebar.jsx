import {
    CalculatorIcon, ReceiptPercentIcon, ScaleIcon, BanknotesIcon, CurrencyDollarIcon,
    BoltIcon, ArrowTrendingUpIcon, ChartBarIcon, LightBulbIcon, ArrowTrendingDownIcon,
    HeartIcon, CpuChipIcon, ChatBubbleOvalLeftEllipsisIcon, LanguageIcon, BookOpenIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

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
    const companies = ["TCS", "Infosys", "Wipro", "Cognizant", "Amazon", "Accenture"];

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
        </>
    );
};

export default Sidebar;
