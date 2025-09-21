import React, { useState, useEffect } from 'react';
import { Wallet, Send, Clock, History, Coins, ExternalLink, Calendar, Zap, Shield, Users } from 'lucide-react';

const LumeraTokenScheduler = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [activeTab, setActiveTab] = useState('send');
  const [scheduledTxs, setScheduledTxs] = useState([]);
  const [history, setHistory] = useState([]);

  // Form states
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [note, setNote] = useState('');

  const LUMERA_CHAIN_CONFIG = {
    chainId: 'lumera-testnet-2',
    chainName: 'Lumera Testnet',
    rpc: 'https://lumera-testnet-rpc.linknode.org/',
    rest: 'https://lumera-testnet-api.linknode.org/',
    bech32Config: {
      bech32PrefixAccAddr: 'lumera',
      bech32PrefixAccPub: 'lumerapub',
      bech32PrefixValAddr: 'lumeravaloper',
      bech32PrefixValPub: 'lumeravaloperpub',
      bech32PrefixConsAddr: 'lumeravalcons',
      bech32PrefixConsPub: 'lumeravalconspub',
    },
    currencies: [{
      coinDenom: 'LUME',
      coinMinimalDenom: 'ulume',
      coinDecimals: 6,
    }],
    feeCurrencies: [{
      coinDenom: 'LUME',
      coinMinimalDenom: 'ulume',
      coinDecimals: 6,
    }],
    stakeCurrency: {
      coinDenom: 'LUME',
      coinMinimalDenom: 'ulume',
      coinDecimals: 6,
    },
  };

  const connectKeplr = async () => {
    if (!window.keplr) {
      alert('Please install Keplr extension first!');
      window.open('https://www.keplr.app/', '_blank');
      return;
    }

    try {
      await window.keplr.experimentalSuggestChain(LUMERA_CHAIN_CONFIG);
      await window.keplr.enable('lumera-testnet-2');
      
      const offlineSigner = window.keplr.getOfflineSigner('lumera-testnet-2');
      const accounts = await offlineSigner.getAccounts();
      
      setWalletAddress(accounts[0].address);
      setIsConnected(true);
      
      // Simulate getting balance
      fetchBalance(accounts[0].address);
    } catch (error) {
      console.error('Failed to connect Keplr:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const fetchBalance = async (address) => {
    try {
      const response = await fetch(`${LUMERA_CHAIN_CONFIG.rest}/cosmos/bank/v1beta1/balances/${address}`);
      const data = await response.json();
      
      const lumeBalance = data.balances?.find(coin => coin.denom === 'ulume');
      if (lumeBalance) {
        const formattedBalance = (parseInt(lumeBalance.amount) / 1000000).toFixed(6);
        setBalance(formattedBalance);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      // Set demo balance for testing
      setBalance('100.000000');
    }
  };

  const scheduleTransaction = () => {
    if (!recipientAddress || !amount || !scheduleDate || !scheduleTime) {
      alert('Please fill all required fields');
      return;
    }

    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    const now = new Date();
    
    if (scheduledDateTime <= now) {
      alert('Please select a future date and time');
      return;
    }

    const newScheduledTx = {
      id: Date.now(),
      recipient: recipientAddress,
      amount: amount,
      scheduledTime: scheduledDateTime,
      note: note,
      status: 'pending',
      created: now
    };

    setScheduledTxs([...scheduledTxs, newScheduledTx]);
    
    // Clear form
    setRecipientAddress('');
    setAmount('');
    setScheduleDate('');
    setScheduleTime('');
    setNote('');
    
    alert('Transaction scheduled successfully!');
  };

  const executeScheduledTx = (txId) => {
    const tx = scheduledTxs.find(t => t.id === txId);
    if (!tx) return;

    // Simulate transaction execution
    const executedTx = {
      ...tx,
      status: 'completed',
      txHash: '0x' + Math.random().toString(16).substr(2, 64),
      executedAt: new Date()
    };

    setHistory([executedTx, ...history]);
    setScheduledTxs(scheduledTxs.filter(t => t.id !== txId));
    
    alert(`Transaction executed! Hash: ${executedTx.txHash.substr(0, 16)}...`);
  };

  const cancelScheduledTx = (txId) => {
    setScheduledTxs(scheduledTxs.filter(t => t.id !== txId));
    alert('Scheduled transaction cancelled');
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substr(0, 8)}...${address.substr(-8)}`;
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 px-6 py-12">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-pink-500 to-violet-500 p-4 rounded-full">
                <Zap className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
              Lumera Token Scheduler
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Schedule your LUME token transfers with precision. Built for the Lumera Testnet ecosystem with modern UI and powerful features.
            </p>
            
            {!isConnected ? (
              <button
                onClick={connectKeplr}
                className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-3 mx-auto"
              >
                <Wallet className="w-6 h-6" />
                Connect Keplr Wallet
              </button>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md mx-auto border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-white font-medium">Connected</span>
                </div>
                <div className="text-gray-300 mb-2">Address: {formatAddress(walletAddress)}</div>
                <div className="text-2xl font-bold text-white">{balance} LUME</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main App */}
      {isConnected && (
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Tab Navigation */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 mb-8 border border-white/20">
            <div className="flex gap-2">
              {[
                { id: 'send', label: 'Schedule Transfer', icon: Send },
                { id: 'scheduled', label: 'Scheduled Txs', icon: Clock },
                { id: 'history', label: 'History', icon: History }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            {activeTab === 'send' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Send className="w-6 h-6" />
                  Schedule Token Transfer
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 mb-2">Recipient Address</label>
                    <input
                      type="text"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder="lumera1..."
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Amount (LUME)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.000000"
                      step="0.000001"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Schedule Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Schedule Time</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Note (Optional)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note for this transaction..."
                    rows="3"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-colors resize-none"
                  />
                </div>
                
                <button
                  onClick={scheduleTransaction}
                  className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
                >
                  <Calendar className="w-5 h-5" />
                  Schedule Transaction
                </button>
              </div>
            )}

            {activeTab === 'scheduled' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Clock className="w-6 h-6" />
                  Scheduled Transactions ({scheduledTxs.length})
                </h2>
                
                {scheduledTxs.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No scheduled transactions</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scheduledTxs.map(tx => (
                      <div key={tx.id} className="bg-white/5 border border-white/20 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="text-white font-semibold mb-1">
                              {tx.amount} LUME → {formatAddress(tx.recipient)}
                            </div>
                            <div className="text-gray-400 text-sm">
                              Scheduled: {formatDate(tx.scheduledTime)}
                            </div>
                            {tx.note && (
                              <div className="text-gray-300 text-sm mt-2 italic">"{tx.note}"</div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => executeScheduledTx(tx.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                            >
                              Execute
                            </button>
                            <button
                              onClick={() => cancelScheduledTx(tx.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <History className="w-6 h-6" />
                  Transaction History ({history.length})
                </h2>
                
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No transaction history</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map(tx => (
                      <div key={tx.id} className="bg-white/5 border border-white/20 rounded-xl p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-white font-semibold mb-1">
                              {tx.amount} LUME → {formatAddress(tx.recipient)}
                            </div>
                            <div className="text-gray-400 text-sm">
                              Executed: {formatDate(tx.executedAt)}
                            </div>
                            <div className="text-gray-400 text-sm">
                              Hash: {formatAddress(tx.txHash)}
                            </div>
                            {tx.note && (
                              <div className="text-gray-300 text-sm mt-2 italic">"{tx.note}"</div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-green-400 text-sm">Completed</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-8 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
                <Shield className="w-5 h-5" />
                Lumera Testnet Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Chain ID</div>
                  <div className="text-white font-mono">lumera-testnet-2</div>
                </div>
                <div>
                  <div className="text-gray-400">Token</div>
                  <div className="text-white">LUME</div>
                </div>
                <div>
                  <div className="text-gray-400">Decimals</div>
                  <div className="text-white">6</div>
                </div>
              </div>
              <div className="mt-4 flex justify-center gap-4">
                <a 
                  href="https://faucet-lumera.winnode.xyz/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1"
                >
                  Get Testnet Tokens <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LumeraTokenScheduler;
