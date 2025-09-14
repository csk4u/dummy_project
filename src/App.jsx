/**
 * @file trading_platform_v2.jsx
 * @description This file contains the complete frontend for the ScreenerOn trading platform.
 * It's a single-file React application featuring a dashboard, screener, backtester,
 * strategy builder, paper trading module, user settings, and a new subscription page.
 * It uses recharts for data visualization and lucide-react for icons.
 * @author AI Assistant
 * @date 2025-09-09
 */

import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
    TrendingUp, Filter, History, Paperclip, BookOpen, Settings, User, Bell, 
    Search, ChevronDown, PlusCircle, Play, Code, LogIn, Eye, EyeOff, Trash2, 
    Plus, Edit, XCircle, Key, CheckCircle, StopCircle, LogOut, UserCog, Bot, 
    Award
} from 'lucide-react';

// --- MOCK DATA ---
// This section contains static data used throughout the application for demonstration purposes.
// In a real-world scenario, this data would be fetched from APIs.

/**
 * Mock data for the portfolio performance chart on the dashboard.
 * @type {Array<Object>}
 */
const mockPortfolioData = [
  { name: '9:15', value: 100000 }, { name: '10:00', value: 101500 }, { name: '11:00', value: 100500 },
  { name: '12:00', value: 102300 }, { name: '1:00', value: 102800 }, { name: '2:00', value: 103500 }, { name: '3:30', value: 103200 },
];

/**
 * Initial mock data for the user's watchlist.
 * @type {Array<Object>}
 */
const initialMockWatchlist = [
  { symbol: 'RELIANCE', price: '2,910.45', change: '+25.60', changePercent: '+0.89%', trend: 'up' }, { symbol: 'TCS', price: '3,845.10', change: '-12.30', changePercent: '-0.32%', trend: 'down' },
  { symbol: 'HDFCBANK', price: '1,520.80', change: '+5.75', changePercent: '+0.38%', trend: 'up' }, { symbol: 'INFY', price: '1,505.00', change: '-20.15', changePercent: '-1.32%', trend: 'down' },
  { symbol: 'ICICIBANK', price: '1,108.25', change: '+1.90', changePercent: '+0.17%', trend: 'up' },
];

/**
 * Mock data for the user's current open positions.
 * @type {Array<Object>}
 */
const mockPositions = [
    { symbol: 'NIFTYBEES', qty: 100, avg: '250.10', ltp: '255.45', pnl: '+535.00' }, { symbol: 'SBIN', qty: 50, avg: '820.50', ltp: '830.75', pnl: '+512.50' },
    { symbol: 'TATAMOTORS', qty: 200, avg: '980.00', ltp: '972.30', pnl: '-1540.00' },
];

/**
 * Mock data for the results of a stock screener scan.
 * @type {Array<Object>}
 */
const mockScreenerResults = [
    { symbol: 'WIPRO', price: 485.50, change: 1.2, marketCap: '2,52,000 Cr', volume: '1.2 Cr' },
    { symbol: 'BAJFINANCE', price: 7210.80, change: -0.5, marketCap: '4,45,000 Cr', volume: '5. Lakh' },
    { symbol: 'ITC', price: 430.15, change: 0.8, marketCap: '5,37,000 Cr', volume: '2.5 Cr' },
    { symbol: 'ADANIENT', price: 3180.00, change: 2.5, marketCap: '3,62,000 Cr', volume: '80 Lakh' },
];

/**
 * A comprehensive mock result object for a strategy backtest.
 * @type {Object}
 */
const mockBacktestResult = {
    trades: 42, netProfit: "₹24,500.00", profitFactor: 2.15, maxDrawdown: "-8.2%", expectancy: "₹583.33",
    sharpeRatio: 1.3, sortinoRatio: 1.9, score: 8.5,
    data: [
        { name: 'Jan', value: 100000 }, { name: 'Feb', value: 105000 }, { name: 'Mar', value: 102000 },
        { name: 'Apr', value: 110000 }, { name: 'May', value: 115000 }, { name: 'Jun', value: 112000 },
        { name: 'Jul', value: 118000 }, { name: 'Aug', value: 121000 }, { name: 'Sep', value: 119000 },
        { name: 'Dec', value: 124500 },
    ],
    tradeLog: [
        { trade_type: 'BUY', stopLoss: '2%', trailingsl: '1.5%', entry_time: '2023-01-05 09:30', exit_time: '2023-01-05 14:55', risk: '2000', exit_reason: 'Target Hit', entry_price: 22150.50, exit_price: 22350.50, net_pnl_points: '+200.00' },
        { trade_type: 'BUY', stopLoss: '2%', trailingsl: '1.5%', entry_time: '2023-01-08 10:15', exit_time: '2023-01-08 12:45', risk: '2000', exit_reason: 'Stoploss Hit', entry_price: 22410.20, exit_price: 22302.20, net_pnl_points: '-108.00' },
    ]
};

/**
 * Mock list of Indian stocks and indices for the searchable combobox.
 * @type {Array<string>}
 */
const indianStockSymbols = [
    'NIFTY 50', 'BANKNIFTY', 'FINNIFTY', 'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'HINDUNILVR', 'SBIN',
    'BAJFINANCE', 'BHARTIARTL', 'KOTAKBANK', 'ITC', 'WIPRO', 'ADANIENT', 'TATAMOTORS', 'AXISBANK', 'LT', 'ASIANPAINT'
];


// --- MAIN APP COMPONENT ---

/**
 * The root component of the ScreenerOn application.
 * It manages the overall application state, including authentication and navigation.
 * @returns {JSX.Element} The main application structure.
 */
export default function App() {
  // State to track the currently active tab/page.
  const [activeTab, setActiveTab] = useState('dashboard');
  // State to manage user authentication status.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // State to hold user-created and saved strategies.
  const [savedStrategies, setSavedStrategies] = useState([
      { id: 1, name: 'EMA Crossover', strategyType: 'buy', entryConditions: [], exitStrategy: {} },
      { id: 2, name: 'RSI Momentum', strategyType: 'sell', entryConditions: [], exitStrategy: {} }
  ]);
 
  /**
   * Handles user sign-out by resetting authentication state.
   */
  const handleSignOut = () => {
    setIsAuthenticated(false);
    setActiveTab('dashboard'); // Reset to default tab on logout
  };

  // If the user is not authenticated, render the LoginScreen.
  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  /**
   * Renders the main content based on the active tab.
   * This acts as a simple router for the single-page application.
   * @returns {JSX.Element} The component for the currently active page.
   */
  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'screener': return <Screener />;
      case 'backtest': return <Backtester />;
      case 'strategy': return <MyStrategiesPage savedStrategies={savedStrategies} setSavedStrategies={setSavedStrategies} />;
      case 'papertrade': return <PaperTradingPage savedStrategies={savedStrategies} />;
      case 'orders': return <FeaturePlaceholder title="Order Management" description="View and manage all your open, executed, and pending orders in one place." />;
      case 'subscription': return <SubscriptionPage />;
      case 'settings': return <SettingsPage />;
      case 'profile': return <ProfilePage />;
      default: return <Dashboard />;
    }
  };
 
  // Main authenticated view of the application.
  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen w-screen font-sans flex antialiased">
      {/* AI-enhanced styling: Global styles for animations, gradients, and modern UI effects. */}
      <style>{`
        @keyframes subtle-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .ai-pulse {
          animation: subtle-pulse 4s infinite ease-in-out;
        }
        .glass-card {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(56, 189, 248, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }
        .gradient-text {
          background: linear-gradient(90deg, #2dd4bf, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .main-bg {
          background-color: #020617;
          background-image: radial-gradient(circle at top left, rgba(56, 189, 248, 0.15) 0%, transparent 30%),
                            radial-gradient(circle at bottom right, rgba(236, 72, 153, 0.1) 0%, transparent 40%);
        }
      `}</style>
      <Sidebar setActiveTab={setActiveTab} activeTab={activeTab} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto main-bg">
        <Header setActiveTab={setActiveTab} handleSignOut={handleSignOut} />
        {renderContent()}
      </main>
    </div>
  );
}

// --- LOGIN COMPONENT ---

/**
 * Component for handling user login and signup.
 * @param {Object} props - Component props.
 * @param {Function} props.onLogin - Callback function to execute on successful login.
 * @returns {JSX.Element} The login/signup form.
 */
const LoginScreen = ({ onLogin }) => {
    // State to toggle between login and signup views.
    const [view, setView] = useState('login');
    // State for login form fields.
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    // State for password visibility toggle.
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
   
    // State for signup form fields.
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');

    /**
     * Handles the login form submission.
     * @param {React.FormEvent} e - The form event.
     */
    const handleLogin = (e) => {
        e.preventDefault();
        // Mock authentication check.
        if (username === 'admin' && password === 'admin') {
            onLogin();
        } else {
            setError('Invalid username or password.');
        }
    };
   
    /**
     * Handles the signup form submission.
     * @param {React.FormEvent} e - The form event.
     */
    const handleSignUp = (e) => {
        e.preventDefault();
        // In a real app, this would involve API calls and validation.
        console.log("Signing up with:", { fullName, email, mobile, password });
        onLogin(); // Auto-login after signup for this demo.
    };

    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen w-screen flex items-center justify-center p-4 main-bg">
            <div className="w-full max-w-md glass-card p-8 rounded-2xl shadow-2xl">
                <div className="text-center mb-8">
                      <Bot className="text-cyan-400 h-12 w-12 mx-auto mb-2 ai-pulse"/>
                    <h1 className="text-3xl font-bold gradient-text">ScreenerOn</h1>
                    <p className="text-gray-400">{view === 'login' ? 'Algorithmic Trading Platform' : 'Create your account to start.'}</p>
                </div>

                {view === 'login' ? (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">Username</label>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="admin"/>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">Password</label>
                            <div className="relative">
                              <input type={isPasswordVisible ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="admin"/>
                               <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white">
                                    {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                               </button>
                            </div>
                        </div>
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/20 flex items-center justify-center"><LogIn className="mr-2" size={18} /> Login</button>
                    </form>
                ) : (
                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div><label className="text-sm font-bold text-gray-400 block mb-2">Full Name</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3" required /></div>
                        <div><label className="text-sm font-bold text-gray-400 block mb-2">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3" required /></div>
                        <div><label className="text-sm font-bold text-gray-400 block mb-2">Mobile Number</label><input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3" required/></div>
                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">Password</label>
                            <div className="relative">
                              <input type={isPasswordVisible ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 pr-10" required />
                               <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white">
                                    {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                               </button>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition-colors">Create Account</button>
                    </form>
                )}
               
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-900 text-gray-400">OR</span>
                    </div>
                </div>

                <div>
                    <button
                        type="button"
                        onClick={() => { console.log("Google Login initiated"); onLogin(); }}
                        className="w-full flex items-center justify-center py-3 px-4 bg-white text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.01,35.638,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        </svg>
                        Continue with Google
                    </button>
                </div>


                <div className="text-center mt-6">
                    <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="text-sm text-cyan-400 hover:underline">
                        {view === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- LAYOUT COMPONENTS ---

/**
 * The main sidebar navigation for the application.
 * @param {Object} props - Component props.
 * @param {Function} props.setActiveTab - Function to set the active tab.
 * @param {string} props.activeTab - The current active tab.
 * @returns {JSX.Element} The sidebar component.
 */
const Sidebar = ({ setActiveTab, activeTab }) => {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <TrendingUp size={20} /> },
    { id: 'screener', name: 'Screener', icon: <Filter size={20} /> },
    { id: 'backtest', name: 'Backtest', icon: <History size={20} /> },
    { id: 'strategy', name: 'My Strategies', icon: <Code size={20} /> },
    { id: 'papertrade', name: 'Paper Trading', icon: <Paperclip size={20} /> },
    { id: 'orders', name: 'Orders', icon: <BookOpen size={20} /> },
    { id: 'subscription', name: 'Subscription', icon: <Award size={20} /> },
    { id: 'settings', name: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <nav className="w-16 md:w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen sticky top-0">
       <div className="flex items-center justify-center md:justify-start p-4 h-16 border-b border-gray-800">
        <Bot className="text-cyan-400 h-8 w-8 ai-pulse" />
        <h1 className="hidden md:block text-xl font-bold ml-2 gradient-text">ScreenerOn</h1>
      </div>
      <ul className="flex-1 px-2 py-4 space-y-2">
        {navItems.map(item => (
          <li key={item.id}>
            <button 
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center justify-center md:justify-start w-full p-3 my-1 rounded-lg transition-all duration-200 group relative ${activeTab === item.id ? 'bg-cyan-500/10 text-cyan-300' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'}`}
            >
              {item.icon}
              <span className="hidden md:inline ml-4 font-medium">{item.name}</span>
              <span className={`absolute left-0 top-0 h-full w-1 bg-cyan-400 rounded-r-full transition-transform duration-300 ease-in-out ${activeTab === item.id ? 'scale-y-100' : 'scale-y-0'}`}></span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

/**
 * The header component displayed at the top of the main content area.
 * @param {Object} props - Component props.
 * @param {Function} props.setActiveTab - Function to set the active tab.
 * @param {Function} props.handleSignOut - Function to handle user sign-out.
 * @returns {JSX.Element} The header component.
 */
const Header = ({ setActiveTab, handleSignOut }) => {
    // State to manage the visibility of the user profile dropdown menu.
    const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
    // Ref to the menu for detecting outside clicks.
    const menuRef = useRef(null);

    // Effect to handle clicks outside the profile menu to close it.
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Dashboard</h2>
          <p className="text-gray-400">Welcome back, here is your market overview.</p>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input type="text" placeholder="Search..." className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-cyan-400"/>
          </div>
          <button className="p-2 rounded-full hover:bg-gray-800"><Bell size={20} /></button>
          <div className="relative" ref={menuRef}>
            <button onClick={() => setProfileMenuOpen(!isProfileMenuOpen)} className="p-2 rounded-full hover:bg-gray-800"><User size={20} /></button>
            {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 z-50">
                    <button onClick={() => { setActiveTab('profile'); setProfileMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"><UserCog size={16} className="mr-2"/> Edit Profile</button>
                    <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"><LogOut size={16} className="mr-2"/> Sign Out</button>
                </div>
            )}
          </div>
        </div>
      </header>
    );
};

// --- DASHBOARD PAGE ---

/**
 * The main dashboard component.
 * @returns {JSX.Element} The dashboard layout.
 */
const Dashboard = () => (
  <div className="space-y-6">
    <SymbolSearch />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <PortfolioChart />
        <PositionsTable />
      </div>
      <div className="lg:col-span-1 space-y-6">
        <Watchlist />
      </div>
    </div>
  </div>
);

/**
 * A searchable combobox for finding and selecting stock symbols.
 * @returns {JSX.Element} The symbol search component.
 */
const SymbolSearch = () => {
    // State for the user's search input.
    const [searchTerm, setSearchTerm] = useState('');
    // State to control dropdown visibility.
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    // Ref for the component to detect outside clicks.
    const searchRef = useRef(null);

    // Filter symbols based on the search term.
    const filteredSymbols = indianStockSymbols.filter(symbol =>
        symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Effect to close dropdown on outside click.
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectSymbol = (symbol) => {
        setSearchTerm(symbol);
        setIsDropdownOpen(false);
        // In a real app, you might trigger a data fetch for the selected symbol here.
    };

    return (
        <div className="relative" ref={searchRef}>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Search for a stock or index (e.g., RELIANCE, NIFTY 50)..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
            </div>
            {isDropdownOpen && searchTerm && filteredSymbols.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                    <ul>
                        {filteredSymbols.map(symbol => (
                            <li
                                key={symbol}
                                onClick={() => handleSelectSymbol(symbol)}
                                className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                            >
                                {symbol}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


/**
 * Chart component to display portfolio value over time.
 * @returns {JSX.Element} The portfolio chart card.
 */
const PortfolioChart = () => {
    // State to display the current value on hover.
    const [currentValue, setCurrentValue] = useState(mockPortfolioData[mockPortfolioData.length - 1].value);
   
    /**
     * Custom tooltip content component for the chart.
     * Updates the displayed portfolio value on hover.
     */
    const CustomTooltipContent = ({ active, payload }) => {
        useEffect(() => {
            if (active && payload && payload.length) {
                setCurrentValue(payload[0].value);
            }
        }, [active, payload]);
        return null; // The tooltip itself is not rendered, only used for its hover effect.
    };
   
    /**
     * Resets the displayed value when the mouse leaves the chart area.
     */
    const handleMouseLeave = () => {
        setCurrentValue(mockPortfolioData[mockPortfolioData.length - 1].value);
    };

    return (
        <div className="glass-card p-6 rounded-xl">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm text-gray-400">Portfolio Value</p>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-300">₹{currentValue.toLocaleString('en-IN')}</p>
                    <p className="text-green-400 font-semibold">+₹3,200.00 (+3.20%) Today</p>
                </div>
            </div>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <AreaChart data={mockPortfolioData} onMouseLeave={handleMouseLeave} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <defs><linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/><stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/></linearGradient></defs>
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" domain={['dataMin - 500', 'dataMax + 500']} hide />
                        <Tooltip content={<CustomTooltipContent />} cursor={{ stroke: '#14b8a6', strokeWidth: 1, strokeDasharray: '3 3' }}/>
                        <Area type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorUv)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

/**
 * Table component to display the user's current open positions.
 * @returns {JSX.Element} The positions table card.
 */
const PositionsTable = () => (
  <div className="glass-card p-6 rounded-xl">
    <h3 className="text-xl font-bold mb-4">Positions ({mockPositions.length})</h3>
    <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="text-gray-400 text-sm border-b border-gray-700"><th className="py-2">Instrument</th><th className="py-2 text-right">Qty.</th><th className="py-2 text-right">Avg. Price</th><th className="py-2 text-right">LTP</th><th className="py-2 text-right">P&L</th></tr></thead>
        <tbody>{mockPositions.map((pos, index) => (<tr key={index} className="border-b border-gray-700 last:border-b-0"><td className="py-4 font-semibold">{pos.symbol}</td><td className="py-4 text-right">{pos.qty}</td><td className="py-4 text-right">₹{pos.avg}</td><td className="py-4 text-right">₹{pos.ltp}</td><td className={`py-4 text-right font-semibold ${pos.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{pos.pnl}</td></tr>))}</tbody></table></div></div>
);

/**
 * Component for managing and displaying the user's watchlist.
 * @returns {JSX.Element} The watchlist card.
 */
const Watchlist = () => {
    // State to manage the list of items in the watchlist.
    const [watchlist, setWatchlist] = useState(initialMockWatchlist);
    // State for the input field to add a new item.
    const [newItem, setNewItem] = useState('');

    /**
     * Handles the form submission to add a new symbol to the watchlist.
     * @param {React.FormEvent} e - The form event.
     */
    const handleAddItem = (e) => {
        e.preventDefault();
        if (newItem.trim() === '') return;
        // Create a new mock stock object.
        const newStock = {
            symbol: newItem.toUpperCase(),
            price: (Math.random() * 5000).toFixed(2),
            change: ((Math.random() - 0.5) * 50).toFixed(2),
            changePercent: ((Math.random() - 0.5) * 2).toFixed(2) + '%',
            trend: Math.random() > 0.5 ? 'up' : 'down'
        };
        setWatchlist([...watchlist, newStock]);
        setNewItem('');
    };
   
    return (
        <div className="glass-card p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-4">Watchlist</h3>
            <div className="space-y-4">
                {watchlist.map((stock, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4 items-center">
                        <div className="flex flex-col"><span className="font-bold">{stock.symbol}</span><span className="text-sm text-gray-400">₹{stock.price}</span></div>
                        <div className="flex flex-col items-end">
                            <span className={`font-semibold ${stock.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>{stock.change}</span>
                            <span className={`text-sm ${stock.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>({stock.changePercent})</span>
                        </div>
                    </div>
                ))}
            </div>
            <form onSubmit={handleAddItem} className="mt-4 flex gap-2">
                <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Add Symbol..." className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"/>
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-lg"><Plus size={20}/></button>
            </form>
        </div>
    );
};

// --- SCREENER PAGE ---
const Screener = () => {
    const [results, setResults] = useState([]);
    const [scanConditions, setScanConditions] = useState([
        { id: 1, type: 'indicator', property: 'Close', operator: 'greater_than', valueType: 'indicator', valueProperty: 'EMA', valueParams: { period: 20 }, candle: 0 },
        { id: 2, type: 'indicator', property: 'Volume', operator: 'greater_than', valueType: 'number', valueProperty: '100000', valueParams: {}, candle: 0 }
    ]);

    const addCondition = () => {
        const newCondition = { id: Date.now(), type: 'indicator', property: 'RSI', operator: 'less_than', valueType: 'number', valueProperty: '30', valueParams: {period: 14}, candle: 0 };
        setScanConditions([...scanConditions, newCondition]);
    };

    const removeCondition = (id) => {
        setScanConditions(scanConditions.filter(c => c.id !== id));
    };

    const handleRunScan = () => {
        console.log("Running scan with conditions:", scanConditions);
        setResults(mockScreenerResults);
    };
   
    return (
        <div className="space-y-6">
            <div className="glass-card p-6 rounded-xl">
                <h3 className="text-2xl font-bold mb-2">Stock Screener</h3>
                <p className="text-gray-400 mb-6">Find stocks based on your custom technical criteria.</p>
               
                <div className="mb-6">
                    <label className="text-sm text-gray-400 block mb-2">Timeframe</label>
                    <select className="w-full md:w-1/3 bg-gray-700/50 border border-gray-600 rounded-lg p-2 focus:outline-none">
                        <option>5 min</option>
                        <option>15 min</option>
                        <option>1 hour</option>
                        <option>1 day</option>
                    </select>
                </div>
               
                <ConditionGroup title="Scan Conditions" conditions={scanConditions} onAdd={addCondition} onRemove={removeCondition} />
               
                <button onClick={handleRunScan} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/20 flex items-center">
                    <Filter className="mr-2" size={16}/> Run Scan
                </button>
            </div>
           
            {results.length > 0 && (
                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">Results ({results.length})</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-400 text-sm border-b border-gray-700">
                                    <th className="py-2">Symbol</th>
                                    <th className="py-2 text-right">Price (₹)</th>
                                    <th className="py-2 text-right">Change (%)</th>
                                    <th className="py-2 text-right">Market Cap</th>
                                    <th className="py-2 text-right">Volume</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((r, i) => (
                                    <tr key={i} className="border-b border-gray-700 last:border-b-0">
                                        <td className="py-4 font-semibold">{r.symbol}</td>
                                        <td className="py-4 text-right">{r.price.toFixed(2)}</td>
                                        <td className={`py-4 text-right ${r.change > 0 ? 'text-green-400' : 'text-red-400'}`}>{r.change.toFixed(2)}</td>
                                        <td className="py-4 text-right">{r.marketCap}</td>
                                        <td className="py-4 text-right">{r.volume}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- BACKTESTER PAGE ---
const Backtester = () => {
    const [result, setResult] = useState(null);
    const [tradeSide, setTradeSide] = useState('buy');
    const [assetType, setAssetType] = useState('index');
    const [entryConditions, setEntryConditions] = useState([
        { id: 1, type: 'indicator', property: 'Close', operator: 'greater_than', valueType: 'indicator', valueProperty: 'EMA', valueParams: { period: 20 }, candle: 0 },
    ]);
    const [exitStrategy, setExitStrategy] = useState({ type: 'sl', slValue: 2, slUnit: 'percent', tslValue: 1.5, tslUnit: 'percent' });
   
    const assetOptions = {
        index: ['NIFTY 50', 'BANKNIFTY', 'FINNIFTY'],
        stock: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'SBIN']
    };

    const addCondition = () => {
        const newCondition = { id: Date.now(), type: 'indicator', property: 'Close', operator: 'greater_than', valueType: 'indicator', valueProperty: 'EMA', valueParams: { period: 20 }, candle: 0 };
        setEntryConditions([...entryConditions, newCondition]);
    };
   
    const removeCondition = (id) => {
        setEntryConditions(entryConditions.filter(c => c.id !== id));
    };

    const handleRunBacktest = () => { setResult(mockBacktestResult); };
   
    const PerformanceMetric = ({ label, value, positive = true }) => (
        <div className="bg-gray-700/50 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-400">{label}</p>
            <p className={`text-lg font-bold ${positive ? 'text-green-400' : 'text-red-400'}`}>{value}</p>
        </div>
    );


    return (<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-6">
            <div className="glass-card p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-4">Backtest Parameters</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Asset Type</label>
                            <select value={assetType} onChange={(e) => setAssetType(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 focus:outline-none">
                                <option value="index">Index</option>
                                <option value="stock">Stock</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Asset</label>
                            <select className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 focus:outline-none">
                                {assetOptions[assetType].map(opt => <option key={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>
                     <div>
                        <label className="text-sm text-gray-400 block mb-1">Timeframe</label>
                        <select className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 focus:outline-none">
                            <option>5 min</option>
                            <option>15 min</option>
                            <option>25 min</option>
                            <option>1 hour</option>
                            <option>1 day</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Date Range</label>
                        <div className="flex gap-2">
                            <input type="date" className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2"/>
                            <input type="date" className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2"/>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Trade Side</label>
                         <div className="inline-flex rounded-md shadow-sm bg-gray-700/50 border border-gray-600 p-1 w-full">
                            <button onClick={() => setTradeSide('buy')} className={`px-6 py-2 text-sm font-medium rounded-md transition-colors w-1/2 ${tradeSide === 'buy' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                                Buy
                            </button>
                            <button onClick={() => setTradeSide('sell')} className={`px-6 py-2 text-sm font-medium rounded-md transition-colors w-1/2 ${tradeSide === 'sell' ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                                Sell
                            </button>
                        </div>
                    </div>
                    <ConditionGroup title="Entry Conditions" conditions={entryConditions} onAdd={addCondition} onRemove={removeCondition} />
                    <ExitStrategy settings={exitStrategy} onChange={setExitStrategy} />
                </div>
                 <button onClick={handleRunBacktest} className="mt-6 w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/20 flex items-center justify-center"><Play className="mr-2" size={16}/> Run Backtest</button>
            </div>
        </div>
        <div className="xl:col-span-2 space-y-6">
            {result ? (
                <>
                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">Performance Metrics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <PerformanceMetric label="Trades" value={result.trades} />
                        <PerformanceMetric label="Net Profit" value={result.netProfit} positive={!result.netProfit.startsWith('-')} />
                        <PerformanceMetric label="Profit Factor" value={result.profitFactor} />
                        <PerformanceMetric label="Max Drawdown" value={result.maxDrawdown} positive={false} />
                        <PerformanceMetric label="Expectancy" value={result.expectancy} />
                        <PerformanceMetric label="Sharpe Ratio" value={result.sharpeRatio} />
                        <PerformanceMetric label="Sortino Ratio" value={result.sortinoRatio} />
                        <PerformanceMetric label="Score" value={result.score} />
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={result.data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                               <defs><linearGradient id="colorResult" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                               <XAxis dataKey="name" stroke="#64748b" />
                               <YAxis stroke="#64748b" domain={['dataMin - 5000', 'dataMax + 5000']} hide/>
                               <Tooltip />
                               <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorResult)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-xl">
                     <h3 className="text-xl font-bold mb-4">Trade Log</h3>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-gray-400 border-b border-gray-700">
                                    <th className="py-2 px-2">Type</th><th className="py-2 px-2">Entry Time</th><th className="py-2 px-2">Exit Time</th>
                                    <th className="py-2 px-2 text-right">Entry Price</th><th className="py-2 px-2 text-right">Exit Price</th>
                                    <th className="py-2 px-2">Exit Reason</th><th className="py-2 px-2 text-right">SL</th>
                                    <th className="py-2 px-2 text-right">Trail SL</th><th className="py-2 px-2 text-right">PNL (Pts)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.tradeLog.map((trade, index) => (
                                    <tr key={index} className="border-b border-gray-700 last:border-b-0">
                                        <td className={`py-3 px-2 font-semibold ${trade.trade_type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>{trade.trade_type}</td>
                                        <td className="py-3 px-2 text-gray-300">{trade.entry_time}</td><td className="py-3 px-2 text-gray-300">{trade.exit_time}</td>
                                        <td className="py-3 px-2 text-right">{trade.entry_price.toFixed(2)}</td><td className="py-3 px-2 text-right">{trade.exit_price.toFixed(2)}</td>
                                        <td className="py-3 px-2">{trade.exit_reason}</td><td className="py-3 px-2 text-right">{trade.stopLoss}</td>
                                        <td className="py-3 px-2 text-right">{trade.trailingsl}</td><td className={`py-3 px-2 text-right font-semibold ${trade.net_pnl_points.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{trade.net_pnl_points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                </div>
                </>
            ) : <div className="glass-card p-6 rounded-xl flex items-center justify-center h-full text-center"><p className="text-gray-500">Run a backtest to see the results.</p></div>}
        </div>
    </div>);
};

// --- PROFILE PAGE ---
const ProfilePage = () => {
    const [profile, setProfile] = useState({ fullName: 'Admin User', email: 'admin@screeneron.com', mobile: '9876543210', address: '123 Market Street, Mumbai'});
    const [isSaved, setIsSaved] = useState(false);
   
    const handleChange = (e) => setProfile({...profile, [e.target.name]: e.target.value});
   
    const handleSave = (e) => {
        e.preventDefault();
        console.log("Saving profile:", profile);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="glass-card p-6 rounded-xl max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center"><UserCog className="mr-3 text-cyan-400"/>Edit Profile</h2>
            <form onSubmit={handleSave} className="space-y-6">
                <div><label className="text-sm font-bold text-gray-400 block mb-2">Full Name</label><input type="text" name="fullName" value={profile.fullName} onChange={handleChange} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3"/></div>
                <div><label className="text-sm font-bold text-gray-400 block mb-2">Email Address</label><input type="email" name="email" value={profile.email} onChange={handleChange} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3"/></div>
                <div><label className="text-sm font-bold text-gray-400 block mb-2">Mobile Number</label><input type="tel" name="mobile" value={profile.mobile} onChange={handleChange} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3"/></div>
                <div><label className="text-sm font-bold text-gray-400 block mb-2">Address</label><textarea name="address" value={profile.address} onChange={handleChange} rows="3" className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 resize-none"></textarea></div>
                <div className="flex justify-end">
                    <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">Save Changes</button>
                </div>
                 {isSaved && (<div className="flex items-center text-green-400 bg-green-900/50 p-3 rounded-lg"><CheckCircle className="mr-2"/> Profile saved successfully!</div>)}
            </form>
        </div>
    );
};


// --- SETTINGS PAGE ---
const SettingsPage = () => {
    const [apiKey, setApiKey] = useState(''); const [apiSecret, setApiSecret] = useState('');
    const [isApiKeyVisible, setIsApiKeyVisible] = useState(false); const [isApiSecretVisible, setIsApiSecretVisible] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
   
    const handleSave = () => { setIsSaved(true); setTimeout(() => setIsSaved(false), 3000); };

    return (
        <div className="glass-card p-6 rounded-xl max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center"><Key className="mr-3 text-cyan-400"/>API & Settings</h2>
            <div className="space-y-6">
                <div>
                    <label className="text-sm font-bold text-gray-400 block mb-2">API Key</label>
                    <div className="relative"><input type={isApiKeyVisible ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 pr-10" placeholder="Enter broker API Key" /><button type="button" onClick={() => setIsApiKeyVisible(!isApiKeyVisible)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white">{isApiKeyVisible ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-400 block mb-2">API Secret</label>
                     <div className="relative"><input type={isApiSecretVisible ? 'text' : 'password'} value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 pr-10" placeholder="Enter broker API Secret"/><button type="button" onClick={() => setIsApiSecretVisible(!isApiSecretVisible)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white">{isApiSecretVisible ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Your keys are stored securely.</p>
                    <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg">Save Keys</button>
                </div>
                {isSaved && (<div className="flex items-center text-green-400 bg-green-900/50 p-3 rounded-lg"><CheckCircle className="mr-2"/> API keys saved successfully!</div>)}
            </div>
        </div>
    );
};


// --- STRATEGIES PAGE & COMPONENTS ---
const MyStrategiesPage = ({ savedStrategies, setSavedStrategies }) => {
    const [view, setView] = useState('list');
    const [strategyToEdit, setStrategyToEdit] = useState(null);

    const handleCreateNew = () => { setStrategyToEdit(null); setView('builder'); };
    const handleEdit = (strategy) => { setStrategyToEdit(strategy); setView('builder'); };
    const handleDelete = (id) => setSavedStrategies(savedStrategies.filter(s => s.id !== id));
    const handleSave = (data) => {
        if (data.id) { setSavedStrategies(savedStrategies.map(s => s.id === data.id ? data : s)); } 
        else { setSavedStrategies([...savedStrategies, { ...data, id: Date.now() }]); }
        setView('list');
    };

    if (view === 'builder') { return <StrategyBuilder onSave={handleSave} onCancel={() => setView('list')} strategyToEdit={strategyToEdit} />; }

    return (
        <div className="glass-card p-6 rounded-xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Strategies</h2>
                <button onClick={handleCreateNew} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center"><PlusCircle className="mr-2" size={16}/> Create New</button>
            </div>
            {savedStrategies.length > 0 ? (
                <div className="space-y-4">
                    {savedStrategies.map(s => (<div key={s.id} className="bg-gray-700/50 p-4 rounded-lg flex justify-between items-center"><span className="font-semibold">{s.name}</span><div className="flex space-x-2"><button onClick={() => handleEdit(s)} className="p-2 text-gray-400 hover:text-white"><Edit size={16}/></button><button onClick={() => handleDelete(s.id)} className="p-2 text-gray-400 hover:text-red-400"><Trash2 size={16}/></button></div></div>))}
                </div>
            ) : (<div className="text-center py-10 text-gray-500"><p>You haven't saved any strategies yet.</p><p>Click "Create New Strategy" to get started.</p></div>)}
        </div>
    );
};

const StrategyBuilder = ({ onSave, onCancel, strategyToEdit }) => {
    const [strategyName, setStrategyName] = useState(strategyToEdit?.name || '');
    const [strategyType, setStrategyType] = useState(strategyToEdit?.strategyType || 'buy');
    const [entryConditions, setEntryConditions] = useState(strategyToEdit?.entryConditions || [{ id: 1, property: 'Close', operator: 'greater_than', valueType: 'indicator', valueProperty: 'EMA', valueParams: { period: 20 }, candle: 0 }]);
    const [exitStrategy, setExitStrategy] = useState(strategyToEdit?.exitStrategy || { type: 'sl', slValue: 2, slUnit: 'percent', tslValue: 1.5, tslUnit: 'percent' });

    const addCondition = () => setEntryConditions([...entryConditions, { id: Date.now(), property: 'Close', operator: 'greater_than', valueType: 'indicator', valueProperty: 'EMA', valueParams: { period: 20 }, candle: 0 }]);
    const removeCondition = (id) => setEntryConditions(entryConditions.filter(c => c.id !== id));
    const handleSaveClick = () => onSave({ id: strategyToEdit?.id, name: strategyName, strategyType, entryConditions, exitStrategy });
   
    return (
        <div className="space-y-6">
            <div className="glass-card p-6 rounded-xl">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <div>
                        <input type="text" value={strategyName} onChange={(e) => setStrategyName(e.target.value)} placeholder="Enter Strategy Name..." className="text-2xl font-bold bg-transparent border-b-2 border-gray-700 focus:border-cyan-400 focus:outline-none"/>
                        <p className="text-gray-400 mt-1">Visually define your trading strategy.</p>
                    </div>
                    <div className="flex space-x-2 mt-4 sm:mt-0">
                         <button className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg" onClick={onCancel}><XCircle className="mr-2 inline" size={16}/> Cancel</button>
                         <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg"><Play className="mr-2 inline" size={16}/> Backtest</button>
                         <button className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg" onClick={handleSaveClick}><PlusCircle className="mr-2 inline" size={16}/> Save</button>
                    </div>
                </div>
                <div className="mb-6"><div className="inline-flex rounded-md shadow-sm bg-gray-700/50 border border-gray-600 p-1"><button onClick={() => setStrategyType('buy')} className={`px-6 py-2 text-sm rounded-md ${strategyType === 'buy' ? 'bg-green-600' : ''}`}>Buy</button><button onClick={() => setStrategyType('sell')} className={`px-6 py-2 text-sm rounded-md ${strategyType === 'sell' ? 'bg-red-600' : ''}`}>Sell</button></div></div>
                <ConditionGroup title={`${strategyType === 'buy' ? 'Buy' : 'Sell'} Entry Conditions`} conditions={entryConditions} onAdd={addCondition} onRemove={removeCondition} />
                <ExitStrategy settings={exitStrategy} onChange={setExitStrategy} />
            </div>
        </div>
    );
};

// --- PAPER TRADING PAGE ---
const PaperTradingPage = ({ savedStrategies }) => {
    const [activeSessions, setActiveSessions] = useState([{ id: 2, name: 'RSI Momentum', status: 'active', pnl: 1250.75, trades: 3, symbol: 'BANKNIFTY' }]);
    const startTrading = (strategy) => { if (activeSessions.find(s => s.id === strategy.id)) return; setActiveSessions([...activeSessions, { id: strategy.id, name: strategy.name, status: 'active', pnl: 0.0, trades: 0, symbol: 'NIFTY 50' }]);};
    const stopTrading = (id) => setActiveSessions(activeSessions.filter(s => s.id !== id));

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold mb-4">Active Paper Trading</h2>
                {activeSessions.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{activeSessions.map(s => (<div key={s.id} className="glass-card p-6 rounded-xl"><div className="flex justify-between items-start"><div><h3 className="text-xl font-bold">{s.name}</h3><p className="text-gray-400">{s.symbol}</p></div><span className="text-xs font-semibold bg-green-600/50 text-green-300 border border-green-500 px-2 py-1 rounded-full">Active</span></div><div className="mt-4"><p className="text-sm text-gray-400">Unrealized P&L</p><p className={`text-2xl font-bold ${s.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>₹{s.pnl.toLocaleString('en-IN')}</p></div><div className="flex justify-between items-center mt-4 text-sm text-gray-400"><span>Trades: {s.trades}</span><button onClick={() => stopTrading(s.id)} className="bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-3 rounded-lg"><StopCircle size={14} className="mr-1 inline"/> Stop</button></div></div>))}</div>) : (<div className="text-center py-10 text-gray-500 glass-card rounded-xl"><p>No active paper trading sessions.</p></div>)}
            </div>
            <div>
                <h2 className="text-2xl font-bold mb-4">Start New Session</h2>
                 {savedStrategies.length > 0 ? (<div className="space-y-4">{savedStrategies.map(s => (<div key={s.id} className="glass-card p-4 rounded-lg flex justify-between items-center transition-all hover:border-cyan-400/50"><span className="font-semibold">{s.name}</span><button onClick={() => startTrading(s)} disabled={!!activeSessions.find(a => a.id === s.id)} className="bg-cyan-600 hover:bg-cyan-500 font-bold py-2 px-4 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed"><Play size={16} className="mr-2 inline"/> Paper Trade</button></div>))}</div>) : (<div className="text-center py-10 text-gray-500 glass-card rounded-xl"><p>Go to "My Strategies" to create one.</p></div>)}
            </div>
        </div>
    );
};

// --- SUBSCRIPTION PAGE ---
const SubscriptionPage = () => {
    // State to track the user's current plan. In a real app, this would come from user data.
    const [currentPlan, setCurrentPlan] = useState('Trial');

    const plans = [
        { name: 'Trial', price: 'Free', duration: 'for 1 month', features: ['All Pro Features', 'Limited Backtests (50/day)', 'Limited Screener Scans (50/day)', 'Email Support'], popular: false, cta: 'Start 1-Month Trial' },
        { name: 'Monthly', price: '499', duration: '/month', features: ['All Pro Features', 'Unlimited Backtests', 'Unlimited Screener Scans', 'Priority Email Support', 'Strategy Auto-Deployment'], popular: false, cta: 'Choose Monthly' },
        { name: 'Half-Yearly', price: '2,499', duration: '/6 months', features: ['All Pro Features', 'Unlimited Backtests', 'Unlimited Screener Scans', 'Priority Email Support', 'Strategy Auto-Deployment', 'Save 16%'], popular: true, cta: 'Choose Half-Yearly' },
        { name: 'Yearly', price: '4,999', duration: '/year', features: ['All Pro Features', 'Unlimited Backtests', 'Unlimited Screener Scans', 'Dedicated Support', 'Strategy Auto-Deployment', 'Save over 20%'], popular: false, cta: 'Choose Yearly' },
    ];

    /**
     * Handles the selection of a new plan.
     * In a real application, this would initiate a payment or setup process.
     * @param {string} planName - The name of the selected plan.
     */
    const handleSelectPlan = (planName) => {
        console.log(`Setting up plan: ${planName}`);
        // This simulates the user successfully subscribing to a new plan.
        setCurrentPlan(planName);
    };

    const PlanCard = ({ plan, isCurrent }) => (
        <div className={`relative glass-card p-6 rounded-xl flex flex-col border-2 transition-all ${isCurrent ? 'border-cyan-400' : 'border-transparent hover:border-gray-700'}`}>
            {plan.popular && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">MOST POPULAR</div>}
            <h3 className="text-xl font-bold text-center">{plan.name}</h3>
            <p className="text-center text-gray-400 mb-4">{plan.name === 'Trial' ? 'Get Started' : 'Billed ' + plan.name}</p>
            <div className="text-center my-4">
                <span className="text-4xl font-extrabold">{plan.price.startsWith('Free') ? 'Free' : `₹${plan.price}`}</span>
                <span className="text-gray-400">{plan.duration}</span>
            </div>
            <ul className="space-y-3 mb-6 flex-grow">
                {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                        <CheckCircle size={16} className="text-green-400 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <button
                onClick={() => handleSelectPlan(plan.name)}
                disabled={isCurrent}
                className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 mt-auto ${
                    isCurrent
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : `bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 ${plan.popular ? 'bg-pink-600 hover:bg-pink-500 shadow-pink-500/20' : ''}`
                }`}
            >
                {isCurrent ? 'Current Plan' : plan.cta}
            </button>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold gradient-text">Choose Your Plan</h2>
                <p className="text-gray-400 max-w-2xl mx-auto mt-2">
                    Unlock advanced features and take your trading to the next level. All plans start with a free 1-month trial of our Pro features.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {plans.map(plan => (
                    <PlanCard key={plan.name} plan={plan} isCurrent={currentPlan === plan.name} />
                ))}
            </div>
        </div>
    );
};

// --- SHARED COMPONENTS ---
const ExitStrategy = ({ settings, onChange }) => {
    const units = ['percent', 'points', 'atr'];
    return (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
             <h4 className="text-lg font-semibold mb-4 text-cyan-400">Exit Conditions</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="flex items-center space-x-2 cursor-pointer mb-2"><input type="radio" name="exitType" value="sl" checked={settings.type === 'sl'} onChange={() => onChange({...settings, type: 'sl'})} className="form-radio h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600"/><span className="text-gray-300">Stop Loss</span></label>
                    <div className="flex gap-2"><input type="number" value={settings.slValue} onChange={(e) => onChange({...settings, slValue: parseFloat(e.target.value) || 0})} disabled={settings.type !== 'sl'} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm disabled:bg-gray-700/50"/><select value={settings.slUnit} onChange={(e) => onChange({...settings, slUnit: e.target.value})} disabled={settings.type !== 'sl'} className="bg-gray-800 border border-gray-600 rounded-md p-2 text-sm disabled:bg-gray-700/50">{units.map(u => <option key={u} value={u} className="capitalize">{u.charAt(0).toUpperCase() + u.slice(1)}</option>)}</select></div>
                </div>
                 <div>
                    <label className="flex items-center space-x-2 cursor-pointer mb-2"><input type="radio" name="exitType" value="tsl" checked={settings.type === 'tsl'} onChange={() => onChange({...settings, type: 'tsl'})} className="form-radio h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600"/><span className="text-gray-300">Trailing Stop Loss</span></label>
                    <div className="flex gap-2"><input type="number" value={settings.tslValue} onChange={(e) => onChange({...settings, tslValue: parseFloat(e.target.value) || 0})} disabled={settings.type !== 'tsl'} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm disabled:bg-gray-700/50"/><select value={settings.tslUnit} onChange={(e) => onChange({...settings, tslUnit: e.target.value})} disabled={settings.type !== 'tsl'} className="bg-gray-800 border border-gray-600 rounded-md p-2 text-sm disabled:bg-gray-700/50">{units.map(u => <option key={u} value={u} className="capitalize">{u.charAt(0).toUpperCase() + u.slice(1)}</option>)}</select></div>
                </div>
             </div>
        </div>
    );
};

const ConditionGroup = ({ title, conditions, onAdd, onRemove }) => (
    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 mb-6">
        <h4 className={`text-lg font-semibold mb-4 ${title.includes('Buy') ? 'text-green-400' : title.includes('Sell') ? 'text-red-400' : 'text-cyan-400'}`}>{title}</h4>
        <div className="overflow-x-auto pb-2">
            <div className="space-y-3 min-w-[950px]">
                {conditions.map((cond) => (
                    <div key={cond.id} className="flex items-center space-x-2">
                        <ConditionRow condition={cond} />
                        <button onClick={() => onRemove(cond.id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded-md">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
        <button onClick={onAdd} className="mt-4 text-cyan-400 hover:text-cyan-300 flex items-center text-sm font-semibold">
            <Plus size={16} className="mr-1"/> Add Condition
        </button>
    </div>
);

const ConditionRow = ({ condition }) => {
    const [lhsIndicator, setLhsIndicator] = useState(condition.property || 'Close');
    const [rhsValueType, setRhsValueType] = useState(condition.valueType || 'indicator');
    const [rhsIndicator, setRhsIndicator] = useState(condition.valueProperty || 'EMA');
   
    const indicators = ['Open', 'High', 'Low', 'Close', 'Volume', 'SMA', 'EMA', 'RSI', 'Supertrend'];
    const operators = ['Greater than', 'Less than', 'Equals', 'Crosses above', 'Crosses below'];
   
    const IndicatorWithParams = ({ value, onChange, params, onParamChange }) => {
        const needsPeriod = ['SMA', 'EMA', 'RSI'].includes(value);
        const needsSupertrendParams = value === 'Supertrend';

        return (
            <div className="flex-grow flex flex-nowrap gap-2 items-center">
                <select value={value} onChange={onChange} className="flex-grow bg-gray-700/50 border border-gray-600 rounded-md p-2 text-sm h-10 min-w-[120px]">
                    {indicators.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>
                {needsPeriod && (<div className="flex items-center bg-gray-700/50 border border-gray-600 rounded-md p-2 text-sm h-10 flex-grow min-w-[100px]"><span className="text-gray-400 mr-2">P:</span><input type="number" value={params?.period || "20"} onChange={e => onParamChange('period', e.target.value)} className="bg-transparent w-full"/></div>)}
                {needsSupertrendParams && (<><div className="flex items-center bg-gray-700/50 border border-gray-600 rounded-md p-2 text-sm h-10 flex-grow min-w-[90px]"><span className="text-gray-400 mr-2">P:</span><input type="number" value={params?.period || "10"} onChange={e => onParamChange('period', e.target.value)} className="bg-transparent w-full"/></div><div className="flex items-center bg-gray-700/50 border border-gray-600 rounded-md p-2 text-sm h-10 flex-grow min-w-[90px]"><span className="text-gray-400 mr-2">M:</span><input type="number" value={params?.multiplier || "3"} onChange={e => onParamChange('multiplier', e.target.value)} className="bg-transparent w-full"/></div></>)}
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-nowrap gap-2 items-center bg-gray-800 p-2 rounded-md">
            <select defaultValue="0" className="bg-gray-700/50 border border-gray-600 rounded-md p-2 text-sm h-10 flex-shrink-0"><option value="0">Latest</option>{[...Array(20).keys()].map(i => <option key={i + 1} value={i + 1}>{i + 1} candle ago</option>)}</select>
            <IndicatorWithParams value={lhsIndicator} onChange={e => setLhsIndicator(e.target.value)} params={{}} onParamChange={()=>{}} />
            <select defaultValue="Greater than" className="bg-gray-700/50 border border-gray-600 rounded-md p-2 text-sm h-10 flex-shrink-0">{operators.map(op => <option key={op}>{op}</option>)}</select>
            <div className="flex-grow flex flex-nowrap gap-2 items-center min-w-[200px]">
                 <select value={rhsValueType} onChange={e => setRhsValueType(e.target.value)} className="bg-gray-700/50 border border-gray-600 rounded-md p-2 text-sm h-10 flex-shrink-0"><option value="indicator">Indicator</option><option value="number">Number</option></select>
                 {rhsValueType === 'indicator' ? (<IndicatorWithParams value={rhsIndicator} onChange={e => setRhsIndicator(e.target.value)} params={{}} onParamChange={()=>{}} />) : (<input type="number" defaultValue="100" className="bg-gray-700/50 border border-gray-600 rounded-md p-2 text-sm h-10 flex-grow" />)}
            </div>
        </div>
    );
};


// --- UTILITY COMPONENTS ---
const FeaturePlaceholder = ({ title, description }) => (
    <div className="glass-card p-8 rounded-xl flex flex-col items-center justify-center text-center h-[calc(100vh-12rem)]">
      <div className="p-4 bg-gray-700/50 rounded-full mb-4"><BookOpen className="h-8 w-8 text-cyan-400"/></div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2><p className="text-gray-400 max-w-md">{description}</p>
      <button className="mt-6 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg">Coming Soon</button>
    </div>
);
