import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';

const BlockchainStats = () => {
  const { provider, signer } = useWeb3();
  const [stats, setStats] = useState({
    totalDonations: '0',
    activeCampaigns: '0',
    totalDonors: '0'
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!provider || !signer) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // Get total number of campaigns
      const totalCampaigns = await contract.getTotalCampaigns();
      
      let totalDonations = ethers.BigNumber.from(0);
      let activeCampaigns = 0;
      const uniqueDonors = new Set();

      // Iterate through all campaigns to calculate stats
      for (let i = 0; i < totalCampaigns.toNumber(); i++) {
        try {
          const campaign = await contract.getCampaign(i);
          
          // Add to total donations
          totalDonations = totalDonations.add(campaign.raised);
          
          // Count active campaigns
          if (campaign.active) {
            activeCampaigns++;
          }
          
          // Get donations for this campaign to count unique donors
          const donations = await contract.getCampaignDonations(i);
          donations.forEach(donation => {
            uniqueDonors.add(donation.donor.toLowerCase());
          });
        } catch (error) {
          console.log(`Campaign ${i} not found or error:`, error.message);
          continue;
        }
      }

      // Convert total donations from Wei to ETH
      const totalDonationsEth = ethers.utils.formatEther(totalDonations);

      setStats({
        totalDonations: parseFloat(totalDonationsEth).toFixed(2),
        activeCampaigns: activeCampaigns.toString(),
        totalDonors: uniqueDonors.size.toString()
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to showing 0 values if there's an error
      setStats({
        totalDonations: '0',
        activeCampaigns: '0',
        totalDonors: '0'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [provider, signer]);

  // Refresh stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (provider && signer) {
        fetchStats();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [provider, signer]);

  if (loading) {
    return (
      <div className="py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Blockchain Impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="stat-card p-6 text-center">
                <div className="animate-pulse">
                  <div className="h-12 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-900/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Blockchain Impact
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="stat-card p-6 text-center"
          >
            <h3 className="text-4xl font-bold text-accent-pink mb-2">
              {stats.totalDonations} ETH
            </h3>
            <p className="text-gray-300">Total Donations</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="stat-card p-6 text-center"
          >
            <h3 className="text-4xl font-bold text-accent-blue mb-2">
              {stats.activeCampaigns}
            </h3>
            <p className="text-gray-300">Active Campaigns</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="stat-card p-6 text-center"
          >
            <h3 className="text-4xl font-bold text-accent-purple mb-2">
              {stats.totalDonors}
            </h3>
            <p className="text-gray-300">Total Donors</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainStats; 