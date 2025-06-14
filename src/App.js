import React, { useState, useEffect } from 'react';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import { createCampaign, donate, withdrawFunds, requestRefund, getCampaign, getTotalCampaigns } from './context/Web3Context';

const CampaignList = ({ campaigns, onDonate, onWithdraw, onRefund, account }) => {
  const [donationAmounts, setDonationAmounts] = useState({});

  const handleDonationInput = (campaignId, amount) => {
    setDonationAmounts(prev => ({
      ...prev,
      [campaignId]: amount
    }));
  };

  const handleDonateClick = (campaignId) => {
    const amount = donationAmounts[campaignId];
    if (amount) {
      onDonate(campaignId, amount);
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {campaigns.map((campaign, index) => (
        <div 
          key={campaign.id} 
          className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {campaign.imageUrl && (
            <div className="relative overflow-hidden group">
              <img 
                src={campaign.imageUrl} 
                alt={campaign.title} 
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
            </div>
          )}
          <div className="p-5">
            <h3 className="text-xl font-semibold mb-2 animate-slide-in">{campaign.title}</h3>
            <p className="text-gray-600 mb-4 animate-fade-in">{campaign.description}</p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4 animate-slide-up">
              <p className="text-gray-700 mb-1">Goal: {campaign.goal} ETH</p>
              <p className="text-gray-700 mb-1">Raised: {campaign.raised} ETH</p>
              <p className="text-gray-700 mb-1">Deadline: {campaign.deadline.toLocaleDateString()}</p>
              <p className="text-gray-700 mb-1">Status: {campaign.active ? 'Active' : 'Ended'}</p>
              <p className="text-gray-700">Creator: {formatAddress(campaign.creator)}</p>
            </div>
            <div className="space-y-3">
              {campaign.active && (
                <div className="flex gap-2 animate-slide-up">
                  <input
                    type="number"
                    placeholder="Amount in ETH"
                    min="0"
                    step="0.01"
                    value={donationAmounts[campaign.id] || ''}
                    onChange={(e) => handleDonationInput(campaign.id, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                  <button 
                    onClick={() => handleDonateClick(campaign.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Donate
                  </button>
                </div>
              )}
              {campaign.creator === account && (
                <div className="space-y-2 animate-slide-up">
                  {campaign.active && campaign.raised >= campaign.goal && (
                    <button 
                      onClick={() => onWithdraw(campaign.id)}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      Withdraw Funds
                    </button>
                  )}
                  {!campaign.active && campaign.raised > 0 && (
                    <button 
                      onClick={() => onWithdraw(campaign.id)}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      Withdraw Funds
                    </button>
                  )}
                </div>
              )}
              {!campaign.active && campaign.raised < campaign.goal && campaign.creator !== account && (
                <button 
                  onClick={() => onRefund(campaign.id)}
                  className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-all duration-200 hover:scale-105 active:scale-95 animate-slide-up"
                >
                  Request Refund
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const CreateCampaign = ({ onCreateCampaign }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    beneficiary: '',
    goal: '',
    durationInDays: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateCampaign(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md animate-slide-up">
      <h2 className="text-2xl font-bold mb-6 animate-fade-in">Create New Campaign</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="animate-slide-in" style={{ animationDelay: '100ms' }}>
          <label className="block text-gray-700 mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>
        <div className="animate-slide-in" style={{ animationDelay: '200ms' }}>
          <label className="block text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>
        <div className="animate-slide-in" style={{ animationDelay: '300ms' }}>
          <label className="block text-gray-700 mb-2">Image URL</label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>
        <div className="animate-slide-in" style={{ animationDelay: '400ms' }}>
          <label className="block text-gray-700 mb-2">Beneficiary Address</label>
          <input
            type="text"
            name="beneficiary"
            value={formData.beneficiary}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>
        <div className="animate-slide-in" style={{ animationDelay: '500ms' }}>
          <label className="block text-gray-700 mb-2">Goal (ETH)</label>
          <input
            type="number"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>
        <div className="animate-slide-in" style={{ animationDelay: '600ms' }}>
          <label className="block text-gray-700 mb-2">Duration (Days)</label>
          <input
            type="number"
            name="durationInDays"
            value={formData.durationInDays}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-200 hover:scale-105 active:scale-95 animate-slide-up"
        >
          Create Campaign
        </button>
      </form>
    </div>
  );
};

const App = () => {
  const {
    account,
    connectWallet,
    network,
    switchToSepolia,
    createCampaign,
    donate,
    withdrawFunds,
    requestRefund,
    getCampaign,
    getTotalCampaigns
  } = useWeb3();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [donationAmounts, setDonationAmounts] = useState({});
  const [donating, setDonating] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);

  const isCorrectNetwork = network?.chainId === '0xaa36a7' || network?.chainId === 11155111;

  const loadCampaigns = async () => {
    try {
      const total = await getTotalCampaigns();
      const campaignPromises = [];
      for (let i = 0; i < total; i++) {
        campaignPromises.push(getCampaign(i));
      }
      const loadedCampaigns = await Promise.all(campaignPromises);
      setCampaigns(loadedCampaigns.filter(Boolean));
    } catch (error) {
      console.error("Error loading campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account && isCorrectNetwork) {
      loadCampaigns();
    }
  }, [account, isCorrectNetwork]);

  const handleCreateCampaign = async (formData) => {
    try {
      const success = await createCampaign(
        formData.title,
        formData.description,
        formData.imageUrl,
        formData.beneficiary,
        formData.goal,
        formData.durationInDays
      );
      if (success) {
        await loadCampaigns();
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Failed to create campaign. Please try again.");
    }
  };

  const handleDonate = async (campaignId, amount) => {
    if (!amount) {
      alert("Please enter a donation amount");
      return;
    }

    try {
      setDonating({ ...donating, [campaignId]: true });
      const success = await donate(campaignId, amount);
      if (success) {
        await loadCampaigns();
        setDonationAmounts({ ...donationAmounts, [campaignId]: '' });
      }
    } catch (error) {
      console.error("Error donating:", error);
      alert("Failed to donate. Please try again.");
    } finally {
      setDonating({ ...donating, [campaignId]: false });
    }
  };

  const handleWithdraw = async (campaignId) => {
    try {
      const success = await withdrawFunds(campaignId);
      if (success) {
        await loadCampaigns();
      }
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      alert("Failed to withdraw funds. Please try again.");
    }
  };

  const handleRefund = async (campaignId) => {
    try {
      const success = await requestRefund(campaignId);
      if (success) {
        await loadCampaigns();
      }
    } catch (error) {
      console.error("Error requesting refund:", error);
      alert("Failed to request refund. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 animate-fade-in">Charity DApp</h1>
            <div className="flex items-center space-x-4">
              {!account ? (
                <button
                  onClick={connectWallet}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-200 hover:scale-105 active:scale-95 animate-slide-in"
                >
                  Connect Wallet
                </button>
              ) : !isCorrectNetwork ? (
                <button
                  onClick={switchToSepolia}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-all duration-200 hover:scale-105 active:scale-95 animate-slide-in"
                >
                  Switch to Sepolia
                </button>
              ) : (
                <div className="flex items-center space-x-4 animate-fade-in">
                  <span className="text-gray-600">
                    Connected: {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                  <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    {showCreateForm ? 'Cancel' : 'Create Campaign'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {account && isCorrectNetwork ? (
          <>
            {showCreateForm && (
              <CreateCampaign onCreateCampaign={handleCreateCampaign} />
            )}
            {loading ? (
              <div className="text-center text-gray-600 animate-pulse-slow">
                Loading campaigns...
              </div>
            ) : (
              <CampaignList
                campaigns={campaigns}
                onDonate={handleDonate}
                onWithdraw={handleWithdraw}
                onRefund={handleRefund}
                account={account}
              />
            )}
          </>
        ) : (
          <div className="text-center text-gray-600 animate-fade-in">
            {!account ? (
              <p>Please connect your wallet to continue</p>
            ) : (
              <p>Please switch to Sepolia network to continue</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default function AppWithProvider() {
  return (
    <Web3Provider>
      <App />
    </Web3Provider>
  );
} 