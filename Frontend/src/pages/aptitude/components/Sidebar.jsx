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
            { name: "Number System", icon: <ReceiptPercentIcon className="w-4 h-4" /> },
            { name: "Averages", icon: <ChartBarIcon className="w-4 h-4" /> },   
            { name: "Ratio and Proportion", icon: <ScaleIcon className="w-4 h-4" /> },
            { name: "Partnership", icon: <ReceiptPercentIcon className="w-4 h-4" /> },
            { name: "Percentage", icon: <ReceiptPercentIcon className="w-4 h-4" /> },
            { name: "Profit and Loss", icon: <BanknotesIcon className="w-4 h-4" /> },
            { name: "Time and Work", icon: <BoltIcon className="w-4 h-4" /> },
            { name: "Data Interpretation", icon: <CurrencyDollarIcon className="w-4 h-4" /> },
            { name: "Pipes and Cisterns", icon: <BoltIcon className="w-4 h-4" /> },
            { name: "Chain Rule", icon: <BoltIcon className="w-4 h-4" /> },
            { name: "Time, Distance and Speed", icon: <ArrowTrendingUpIcon className="w-4 h-4" /> },
            { name: "Boats and Streams", icon: <ArrowTrendingUpIcon className="w-4 h-4" /> },
            { name: "Probability", icon: <ArrowTrendingUpIcon className="w-4 h-4" /> },
            { name: "Permutations and Combinations", icon: <ArrowTrendingUpIcon className="w-4 h-4" /> },
            { name: "Problems on Ages", icon: <ArrowTrendingUpIcon className="w-4 h-4" /> },
            { name: "Mixtures or Allegations", icon: <ArrowTrendingUpIcon className="w-4 h-4" /> },
            { name: "Simple Interest and Compound Interest",icon: <CurrencyDollarIcon className="w-4 h-4" /> },
            { name: "Algebra", icon: <CurrencyDollarIcon className="w-4 h-4" /> },
            { name: "Mensuration and Geometry", icon: <CurrencyDollarIcon className="w-4 h-4" /> },
            
        ]
    },
    Logical: {
        icon: <LightBulbIcon className="w-5 h-5" />,
        topics: [
            { name: "Words/Number-Series", icon: <ArrowTrendingDownIcon className="w-4 h-4" /> },
            { name: "Syllogism", icon: <CpuChipIcon className="w-4 h-4" /> },
            { name: "Calender", icon: <CpuChipIcon className="w-4 h-4" /> },
            { name: "Coding-Decoding", icon: <CpuChipIcon className="w-4 h-4" /> },
            { name: "Seating Arrangements", icon: <CpuChipIcon className="w-4 h-4" /> },
            { name: "Blood Relations", icon: <CpuChipIcon className="w-4 h-4" /> },
            { name: "Clock", icon: <CurrencyDollarIcon className="w-4 h-4" /> },
            { name: "Deductive Reasoning", icon: <ArrowTrendingDownIcon className="w-4 h-4" /> },
            { name: "Data Sufficiency", icon: <HeartIcon className="w-4 h-4" /> }, 
        ]
    },
    Verbal: {
        icon: <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />,
        topics: [
            { name: "Synonyms-Antonyms", icon: <LanguageIcon className="w-4 h-4" /> },
            { name: "Vocabulary", icon: <LanguageIcon className="w-4 h-4" /> },
            { name: "Spelling Correction", icon: <LanguageIcon className="w-4 h-4" /> },
            { name: "Odd One Out", icon: <LanguageIcon className="w-4 h-4" /> },
            { name: "Fill in the Blanks", icon: <LanguageIcon className="w-4 h-4" /> },
            { name: "Error Detection", icon: <LanguageIcon className="w-4 h-4" /> }, 
            { name: "Sentence/Word Completion", icon: <LanguageIcon className="w-4 h-4" /> }, 
            // { name: "Word Analogy", icon: <LanguageIcon className="w-4 h-4" /> },
            { name: "Para Jumbles", icon: <LanguageIcon className="w-4 h-4" /> }, 
            { name: "Idioms and Phrases", icon: <LanguageIcon className="w-4 h-4" /> }, 
            { name: "Active-Passive Voice", icon: <LanguageIcon className="w-4 h-4" /> }, 
            { name: "Direct-Indirect Speech", icon: <LanguageIcon className="w-4 h-4" /> }, 
            { name: "Cloze Test", icon: <LanguageIcon className="w-4 h-4" /> }, 
            { name: "Reading Comprehension", icon: <BookOpenIcon className="w-4 h-4" /> },
        ]
    } 
};

const Sidebar = ({ onSelectTopic, activeTopic, isMobileOpen, setIsMobileOpen, selectedCompany, onSelectCompany }) => {
    const companies = ["TCS", "Infosys", "IBM", "Wipro", "Persistent", "Cognizant","Capgemini", "Tech Mahindra", "Accenture", "Deloitte", "LTI Mindtree", "Amazon", "Zoho", "Oracle", ];

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
