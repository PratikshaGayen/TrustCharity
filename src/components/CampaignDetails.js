import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';

const CampaignDetails = () => {
  const { id } = useParams();
  const { provider, signer } = useWeb3();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [donating, setDonating] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [fundsWithdrawn, setFundsWithdrawn] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!provider || !signer) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        // Check if campaign exists
        const campaignExists = await contract.checkCampaignExists(id);
        if (!campaignExists) {
          setError('Campaign not found');
          setLoading(false);
          return;
        }

        // Get campaign details
        const campaignData = await contract.getCampaign(id);
        
        // Get campaign donations
        const donationsData = await contract.getCampaignDonations(id);
        
        // Format donations
        const formattedDonations = donationsData.map(donation => ({
          donor: donation.donor,
          amount: ethers.utils.formatEther(donation.amount),
          timestamp: donation.timestamp.toNumber() * 1000 // Convert to milliseconds
        }));

        // Calculate total raised from donations
        const totalRaised = donationsData.reduce((sum, donation) => 
          sum.add(donation.amount), ethers.BigNumber.from(0)
        );

        // Check if funds have been withdrawn (raised amount is 0 but campaign is inactive)
        const isFundsWithdrawn = !campaignData.active && campaignData.raised.toString() === '0';

        setCampaign({
          id: campaignData.id.toNumber(),
          title: campaignData.title,
          description: campaignData.description,
          imageUrl: campaignData.imageUrl,
          beneficiary: campaignData.beneficiary,
          goal: ethers.utils.formatEther(campaignData.goal),
          raised: ethers.utils.formatEther(totalRaised),
          active: campaignData.active,
          deadline: campaignData.deadline.toNumber() * 1000, // Convert to milliseconds
          creator: campaignData.creator,
          donations: formattedDonations
        });

        setFundsWithdrawn(isFundsWithdrawn);
      } catch (error) {
        console.error('Error fetching campaign:', error);
        setError('Failed to load campaign details');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id, provider, signer]);

  const handleDonate = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to donate');
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    try {
      setDonating(true);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // Convert ETH to Wei
      const amountInWei = ethers.utils.parseEther(donationAmount);
      
      // Get current campaign state before donation
      const campaignBefore = await contract.getCampaign(id);
      const goalReachedBefore = campaignBefore.raised >= campaignBefore.goal;
      
      // Make donation transaction
      const tx = await contract.donate(id, { value: amountInWei });
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Check if goal was reached with this donation
      const campaignAfter = await contract.getCampaign(id);
      const goalReachedAfter = campaignAfter.raised >= campaignAfter.goal;
      
      if (!goalReachedBefore && goalReachedAfter) {
        alert('🎉 Congratulations! Campaign goal has been reached! The campaign is now complete and funds can be withdrawn by the campaign creator or beneficiary.');
      } else {
        alert('Donation successful! Thank you for your contribution.');
      }
      
      setDonationAmount('');
      
      // Refresh campaign data
      window.location.reload();
    } catch (error) {
      console.error('Error donating:', error);
      alert('Failed to process donation: ' + error.message);
    } finally {
      setDonating(false);
    }
  };

  const handleWithdrawFunds = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to withdraw funds');
      return;
    }

    try {
      setWithdrawing(true);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // Get current user address
      const userAddress = await signer.getAddress();
      
      // Check if user is creator or beneficiary
      if (userAddress.toLowerCase() !== campaign.creator.toLowerCase() && 
          userAddress.toLowerCase() !== campaign.beneficiary.toLowerCase()) {
        alert('Only the campaign creator or beneficiary can withdraw funds');
        return;
      }
      
      // Withdraw funds
      const tx = await contract.withdrawFunds(id);
      
      // Wait for transaction to be mined
      await tx.wait();
      
      alert('Funds withdrawn successfully!');
      setFundsWithdrawn(true);
      
      // Refresh campaign data
      window.location.reload();
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      alert('Failed to withdraw funds: ' + error.message);
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading campaign details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Campaign not found</div>
      </div>
    );
  }

  const progress = (parseFloat(campaign.raised) / parseFloat(campaign.goal)) * 100;
  const daysLeft = Math.ceil((campaign.deadline - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <h1 className="text-3xl font-bold text-white mb-4">{campaign.title}</h1>
          <p className="text-gray-300 mb-6">{campaign.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Campaign Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-300">Goal</p>
                  <p className="text-2xl font-bold text-accent-pink">{campaign.goal} ETH</p>
                </div>
                <div>
                  <p className="text-gray-300">Raised</p>
                  <p className="text-2xl font-bold text-accent-pink">{campaign.raised} ETH</p>
                </div>
                <div>
                  <p className="text-gray-300">Days Left</p>
                  <p className="text-2xl font-bold text-accent-pink">
                    {daysLeft > 0 ? daysLeft : 'Campaign ended'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-300">Status</p>
                  <p className={`text-lg font-medium ${campaign.active ? 'text-green-400' : 'text-red-400'}`}>
                    {campaign.active ? 'Active' : 'Inactive'}
                  </p>
                </div>
                {!campaign.active && parseFloat(campaign.raised) >= parseFloat(campaign.goal) && (
                  <div>
                    <p className="text-gray-300">Goal Status</p>
                    <p className="text-lg font-medium text-green-400">
                      🎯 Goal Achieved! 
                      {fundsWithdrawn ? ' ✅ Funds Transferred' : ' ⏳ Funds Pending Transfer'}
                    </p>
                    {!fundsWithdrawn && (
                      <p className="text-sm text-gray-400 mt-1">
                        Campaign creator or beneficiary needs to manually withdraw funds
                      </p>
                    )}
                  </div>
                )}
                {!campaign.active && parseFloat(campaign.raised) < parseFloat(campaign.goal) && (
                  <div>
                    <p className="text-gray-300">Goal Status</p>
                    <p className="text-lg font-medium text-yellow-400">
                      Goal Not Reached - Refunds Available
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-gray-300">Creator</p>
                  <p className="text-lg font-medium text-white">
                    {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-300">Beneficiary</p>
                  <p className="text-lg font-medium text-white">
                    {campaign.beneficiary.slice(0, 6)}...{campaign.beneficiary.slice(-4)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">Donate</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Amount (ETH)</label>
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-accent-blue focus:outline-none"
                    placeholder="0.0"
                    min="0"
                    step="0.01"
                    disabled={!campaign.active || donating}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDonate}
                  disabled={!campaign.active || donating}
                  className={`w-full px-6 py-3 rounded-lg font-medium ${
                    campaign.active && !donating
                      ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {donating ? 'Processing...' : campaign.active ? 'Donate Now' : 'Campaign Ended'}
                </motion.button>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Progress</h2>
            <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                className="h-full bg-gradient-to-r from-accent-blue to-accent-purple"
              />
            </div>
            <p className="text-gray-300 mt-2">{progress.toFixed(1)}% of goal reached</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              Recent Donations ({campaign.donations.length})
            </h2>
            {campaign.donations.length > 0 ? (
              <div className="space-y-4">
                {campaign.donations.map((donation, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-gray-800/50 border border-gray-700"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-300">Donor</p>
                        <p className="text-white font-medium">
                          {donation.donor.slice(0, 6)}...{donation.donor.slice(-4)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300">Amount</p>
                        <p className="text-accent-pink font-bold">{donation.amount} ETH</p>
                      </div>
                      <div>
                        <p className="text-gray-300">Date</p>
                        <p className="text-white">
                          {new Date(donation.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No donations yet. Be the first to donate!</p>
            )}
          </div>

          {fundsWithdrawn ? (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-white mb-4">Funds Withdrawn</h2>
              <p className="text-gray-300">Funds have been withdrawn from this campaign.</p>
            </div>
          ) : !campaign.active && parseFloat(campaign.raised) > 0 ? (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-white mb-4">Withdraw Funds</h2>
              <p className="text-gray-300 mb-4">
                Campaign has ended. {parseFloat(campaign.raised) >= parseFloat(campaign.goal) 
                  ? 'Goal was achieved! ' 
                  : 'Goal was not reached. '}
                Funds can be withdrawn by the campaign creator or beneficiary.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWithdrawFunds}
                disabled={withdrawing}
                className={`w-full px-6 py-3 rounded-lg font-medium ${
                  !withdrawing
                    ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {withdrawing ? 'Processing...' : 'Withdraw Funds'}
              </motion.button>
            </div>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
};

export default CampaignDetails; 