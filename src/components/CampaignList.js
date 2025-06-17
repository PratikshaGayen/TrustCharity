import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import { formatEther } from '@ethersproject/units';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';

const CampaignList = () => {
  const { provider, signer } = useWeb3();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!provider || !signer) {
        setLoading(false);
        return;
      }

      try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const totalCampaigns = await contract.campaignCount();
        
        const campaignsData = [];
        for (let i = 0; i < totalCampaigns; i++) {
          try {
            const campaignData = await contract.getCampaign(i);
            
            // Ensure all required fields are present
            if (!campaignData || campaignData.length < 10) {
              console.warn(`Invalid campaign data for ID ${i}`);
              continue;
            }

            const [
              id,
              title,
              description,
              imageUrl,
              beneficiary,
              goal,
              raised,
              active,
              deadline,
              creator
            ] = campaignData;
            
            // Validate and convert values
            const campaign = {
              id: id ? id.toNumber() : i,
              title: title || 'Untitled Campaign',
              description: description || 'No description available',
              imageUrl: imageUrl || '',
              beneficiary: beneficiary || ethers.constants.AddressZero,
              goal: goal ? formatEther(goal) : '0',
              raised: raised ? formatEther(raised) : '0',
              deadline: deadline ? new Date(deadline.toNumber() * 1000) : new Date(),
              active: Boolean(active),
              creator: creator || ethers.constants.AddressZero
            };
            
            campaignsData.push(campaign);
          } catch (campaignError) {
            console.error(`Error fetching campaign ${i}:`, campaignError);
            // Continue with next campaign instead of failing completely
            continue;
          }
        }
        
        setCampaigns(campaignsData);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [provider, signer]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 mt-8">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 mt-8">
        <p className="text-red-400 mb-4">{error}</p>
        <p className="text-gray-300">Please make sure you have set up your .env file correctly.</p>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12 mt-8">
        <p className="text-gray-300">No campaigns found. Be the first to create one!</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 mt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold mb-2 gradient-text">
              {campaign.title}
            </h3>
            
            <p className="text-gray-300 mb-4 line-clamp-2">
              {campaign.description}
            </p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Goal:</span>
                <span className="font-medium">{campaign.goal} ETH</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Raised:</span>
                <span className="font-medium">{campaign.raised} ETH</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Deadline:</span>
                <span className="font-medium">
                  {campaign.deadline.toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Status:</span>
                <span className={`font-medium ${campaign.active ? 'text-green-400' : 'text-red-400'}`}>
                  {campaign.active ? 'Active' : 'Completed'}
                </span>
              </div>
            </div>
            
            <Link to={`/campaign/${campaign.id}`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary w-full"
              >
                View Details
              </motion.button>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CampaignList; 