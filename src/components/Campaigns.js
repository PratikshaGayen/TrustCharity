import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CampaignList from './CampaignList';

const Campaigns = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 pt-40 pb-16">
        <div className="flex justify-between items-center mb-16">
          <h1 className="text-4xl font-display font-bold gradient-text">
            All Campaigns
          </h1>
          
          <Link to="/create-campaign">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
            >
              Create Campaign
            </motion.button>
          </Link>
        </div>
        
        <div className="glass-card mx-4 mt-4 px-6 py-4">
          <CampaignList />
        </div>
      </div>
    </div>
  );
};

export default Campaigns; 