import React, { useState, useEffect } from 'react';
import { LogIn, LayoutDashboard, Search, Plus, Trash2, Home, User, DollarSign, ArrowUp, ArrowDown, LogOut } from 'lucide-react';
// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signOut, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';

const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [screenerRules, setScreenerRules] = useState([]);
  const [db, setDb] = useState(null);

  // Initialize Firebase and set up auth listener on mount
  useEffect(() => {
    const initializeFirebase = async () => {
        try {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
            const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
    
            if (!firebaseInitialized && firebaseConfig && Object.keys(firebaseConfig).length > 0) {
                const app = initializeApp(firebaseConfig);
                const auth = getAuth(app);
                const firestore = getFirestore(app);
                setDb(firestore);
    
                const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                    if (currentUser) {
                        setUser(currentUser);
                        setCurrentPage('dashboard');
                        console.log("User signed in with UID:", currentUser.uid);
                    } else if (initialAuthToken) {
                        try {
                            await signInWithCustomToken(auth, initialAuthToken);
                        } catch (error) {
                            console.error("Error signing in with custom token:", error);
                            await signInAnonymously(auth);
                        }
                    } else {
                        await signInAnonymously(auth);
                    }
                });
                setFirebaseInitialized(true);
                return () => unsubscribe();
            }
        } catch (e) {
            console.error("Firebase initialization failed:", e);
        }
    };
    initializeFirebase();
  }, [firebaseInitialized]);

  // Handle real-time data from Firestore
  useEffect(() => {
    if (!db || !user) {
      return;
    }
    
    // Define the path for a user's private watchlist data
    const watchlistPath = `/artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/users/${user.uid}/watchlist`;
    const watchlistCollection = collection(db, watchlistPath);

    // Set up a real-time listener for the watchlist
    const unsubscribe = onSnapshot(watchlistCollection, (snapshot) => {
      const newWatchlist = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWatchlist(newWatchlist);
    }, (error) => {
      console.error("Error listening to watchlist:", error);
    });

    // Clean up the listener when the component unmounts or user changes
    return () => unsubscribe();
  }, [db, user]);

  const showMessage = (message) => {
    const messageBoxContent = document.getElementById('message-box-content');
    const messageBox = document.getElementById('message-box');
    if (messageBoxContent && messageBox) {
      messageBoxContent.innerText = message;
      messageBox.classList.remove('hidden');
      setTimeout(() => {
        messageBox.classList.add('hidden');
      }, 3000); // Hide after 3 seconds
    }
  };

  const handleLoginWithCredentials = async (email, password) => {
    const auth = getAuth();
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
    try {
      if (email === 'admin@test.com' && password === 'adminadmin') {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
          showMessage("Login successful!");
        } else {
          showMessage("Test credentials only work with a provided custom auth token.");
        }
      } else {
        console.log("Incorrect credentials. Showing message box.");
        showMessage("Invalid email or password.");
      }
    } catch (error) {
        console.error("Login failed:", error);
        showMessage(`Login failed: ${error.message}`);
    }
  };


  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleSignup = async (email, password) => {
    const auth = getAuth();
    try {
      showMessage("Sign-up is disabled for this test application.");
    } catch (error) {
      console.error("Signup Error:", error);
      showMessage(`Signup failed: ${error.message}`);
    }
  };

  const addScreenerRule = () => {
    setScreenerRules([...screenerRules, { indicator: 'RSI', operator: '>', value: 50 }]);
  };

  const removeScreenerRule = (index) => {
    setScreenerRules(screenerRules.filter((_, i) => i !== index));
  };

  const onRuleChange = (index, key, value) => {
    const newRules = [...screenerRules];
    newRules[index][key] = value;
    setScreenerRules(newRules);
  };

  const onRunScreener = async (strategyName) => {
    showMessage(`Running '${strategyName}' strategy. Please wait...`);

    const payload = {
      strategy_name: strategyName,
      rules: screenerRules,
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/run_strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        let resultsMessage = `Strategy '${strategyName}' completed successfully. \n\n` + JSON.stringify(data.results, null, 2);
        showMessage(resultsMessage);
      } else {
        showMessage(`Error: ${data.detail || "Failed to run strategy."}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showMessage('Network error. Make sure your Python backend is running.');
    }
  };

  const renderPage = () => {
    if (user) {
      if (currentPage === 'screener') {
        return <ScreenerPage 
          screenerRules={screenerRules}
          onAddRule={addScreenerRule}
          onRemoveRule={removeScreenerRule}
          onRuleChange={onRuleChange}
          onRunScreener={onRunScreener}
        />;
      }
      return <DashboardPage watchlist={watchlist} onNavigateToScreener={() => setCurrentPage('screener')} />;
    } else {
      return <LoginPage
        onLoginWithCredentials={handleLoginWithCredentials} 
      />;
    }
  };

  const navItemClass = "flex items-center space-x-3 p-4 transition-colors duration-200 cursor-pointer rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white";

  return (
    <div className="min-h-screen bg-zinc-900 text-white font-sans flex antialiased">
      {user && (
        <aside className="w-64 bg-zinc-950 p-6 flex flex-col space-y-4 shadow-lg border-r border-zinc-800">
          <div className="flex items-center space-x-3 mb-6">
            <DollarSign className="w-8 h-8 text-green-500" />
            <span className="text-xl font-bold">ScreenerOn</span>
          </div>
          <nav className="flex-grow space-y-2">
            <div
              className={`${navItemClass} ${currentPage === 'dashboard' ? 'bg-zinc-800 text-white' : ''}`}
              onClick={() => setCurrentPage('dashboard')}
            >
              <LayoutDashboard />
              <span>Dashboard</span>
            </div>
            <div
              className={`${navItemClass} ${currentPage === 'screener' ? 'bg-zinc-800 text-white' : ''}`}
              onClick={() => setCurrentPage('screener')}
            >
              <Search />
              <span>Screener</span>
            </div>
          </nav>
          <div className="mt-auto pt-4 border-t border-zinc-800">
            <div className={navItemClass} onClick={handleLogout}>
              <LogOut className="rotate-180" />
              <span>Log out</span>
            </div>
          </div>
        </aside>
      )}
      <main className="flex-grow p-8 sm:p-12 overflow-y-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500">
            {user ? (currentPage === 'dashboard' ? 'Real-Time Dashboard' : 'Custom Stock Screener') : 'Welcome to ScreenerOn'}
          </h1>
          <p className="text-zinc-400">
            {user ? (
              currentPage === 'dashboard'
                ? `Live updates for your favorite stocks, ${user.email || user.uid}.`
                : 'Build a strategy to find winning stocks.'
            ) : 'Log in to get started.'}
          </p>
        </header>
        <div className="flex justify-center w-full">
          <div className="w-full max-w-5xl">
            {renderPage()}
          </div>
        </div>
      </main>

      {/* Custom Message Box */}
      <div id="message-box" className="hidden fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
        <div className="bg-zinc-800 p-8 rounded-xl shadow-lg border border-zinc-700 max-w-sm w-full">
          <p id="message-box-content" className="text-white text-center mb-6"></p>
          <button
            onClick={() => document.getElementById('message-box').classList.add('hidden')}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-semibold shadow-lg transition-transform transform hover:scale-105 active:scale-95"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const LoginPage = ({ onLoginWithCredentials }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLoginWithCredentials(email, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen -mt-20">
      <div className="bg-zinc-800 p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-sm border border-zinc-700">
        <div className="flex justify-center mb-6">
          <User className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Sign In to ScreenerOn</h2>
        <p className="text-center text-zinc-400 mb-6 text-sm">
          You can test with: **Email:** `admin@test.com` **Password:** `adminadmin`
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-zinc-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-zinc-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-semibold shadow-lg transition-transform transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Log in with Email
          </button>
        </form>
      </div>
    </div>
  );
};

const DashboardPage = ({ watchlist, onNavigateToScreener }) => {
  return (
    <div className="space-y-12">
      <div className="bg-zinc-800 p-6 rounded-xl shadow-lg border border-zinc-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Watchlist</h2>
          <button
            onClick={onNavigateToScreener}
            className="py-2 px-4 bg-green-600 text-white rounded-lg font-semibold shadow-lg transition-transform transform hover:scale-105 active:scale-95 flex items-center space-x-2"
          >
            <Search size={18} />
            <span>Run Screener</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="text-left text-zinc-400 uppercase text-sm tracking-wide">
                <th className="py-3 px-4">Symbol</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-right">Change</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map(stock => (
                <tr key={stock.symbol} className="border-t border-zinc-700 hover:bg-zinc-850 transition-colors">
                  <td className="py-4 px-4 font-bold text-lg">{stock.symbol}</td>
                  <td className="py-4 px-4 text-zinc-300">{stock.name}</td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-xl font-bold">${stock.price}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`flex items-center justify-end font-semibold text-lg ${stock.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stock.change > 0 ? <ArrowUp size={16} className="mr-1" /> : <ArrowDown size={16} className="mr-1" />}
                      {Math.abs(stock.change)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ScreenerPage = ({ screenerRules, onAddRule, onRemoveRule, onRuleChange, onRunScreener }) => {
  const [selectedStrategy, setSelectedStrategy] = useState('RSI_Breakout');
  const indicators = ['RSI', 'MACD', 'SMA', 'Volume'];
  const operators = ['>', '<', '='];
  const strategies = [
    { name: 'RSI Breakout', value: 'RSI_Breakout' },
    { name: 'Volume Surge', value: 'Volume_Surge' },
    { name: 'Ready-made Strategy 1', value: 'ReadyMade_1' }
  ];

  return (
    <div className="space-y-8 bg-zinc-800 p-6 rounded-xl shadow-lg border border-zinc-700">
      <h2 className="text-2xl font-bold mb-4">Define Your Strategy</h2>
      
      <div className="space-y-2">
        <label className="block text-zinc-300 font-semibold">Select a Strategy</label>
        <select
          value={selectedStrategy}
          onChange={(e) => setSelectedStrategy(e.target.value)}
          className="w-full p-3 bg-zinc-700 rounded-lg border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {strategies.map(s => <option key={s.value} value={s.value}>{s.name}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        <label className="block text-zinc-300 font-semibold">Custom Rules</label>
        {screenerRules.map((rule, index) => (
          <div key={index} className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4 bg-zinc-900 rounded-lg border border-zinc-700">
            <div className="flex-grow w-full sm:w-auto space-y-2 sm:space-y-0 sm:flex-grow-0 sm:flex sm:space-x-4">
              <select
                value={rule.indicator}
                onChange={(e) => onRuleChange(index, 'indicator', e.target.value)}
                className="w-full sm:w-auto p-2 bg-zinc-700 rounded-lg border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {indicators.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
              <select
                value={rule.operator}
                onChange={(e) => onRuleChange(index, 'operator', e.target.value)}
                className="w-full sm:w-auto p-2 bg-zinc-700 rounded-lg border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {operators.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
              <input
                type="number"
                value={rule.value}
                onChange={(e) => onRuleChange(index, 'value', e.target.value)}
                className="w-full sm:w-28 p-2 bg-zinc-700 rounded-lg border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={() => onRemoveRule(index)}
              className="py-2 px-4 bg-red-600 text-white rounded-lg font-semibold transition-transform transform hover:scale-105 active:scale-95"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          onClick={onAddRule}
          className="w-full sm:w-auto py-3 px-6 bg-zinc-700 text-white rounded-lg font-semibold shadow-lg transition-transform transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 border border-zinc-600"
        >
          <Plus size={20} />
          <span>Add Rule</span>
        </button>
        <button
          onClick={() => onRunScreener(selectedStrategy)}
          className="w-full sm:w-auto py-3 px-6 bg-green-600 text-white rounded-lg font-semibold shadow-lg transition-transform transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
        >
          <Search size={20} />
          <span>Run Screener</span>
        </button>
      </div>
    </div>
  );
};

export default App;
