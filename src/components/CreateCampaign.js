import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import { parseEther } from '@ethersproject/units';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';

const CreateCampaign = () => {
  const { signer } = useWeb3();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    durationInDays: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!signer) {
      setError('Wallet not connected.');
      return;
    }

    setLoading(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const beneficiary = await signer.getAddress();
      const goal = parseEther(formData.goal);
      const durationInDays = parseInt(formData.durationInDays, 10);

      // Validation
      if (!formData.title.trim() || !formData.description.trim()) {
        setError('Title and description are required.');
        setLoading(false);
        return;
      }
      if (goal.lte(0)) {
        setError('Goal must be greater than 0.');
        setLoading(false);
        return;
      }
      if (isNaN(durationInDays) || durationInDays < 1) {
        setError('Duration must be at least 1 day.');
        setLoading(false);
        return;
      }

      const tx = await contract.createCampaign(
        formData.title,
        formData.description,
        '',
        beneficiary,
        goal,
        durationInDays
      );

      await tx.wait();
      setFormData({ title: '', description: '', goal: '', durationInDays: '' });
      window.location.href = '/campaigns';
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Error creating campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 max-w-2xl mx-auto"
        >
          <h1 className="text-4xl font-display font-bold mb-8 gradient-text text-center">
            Create a Campaign
          </h1>
          {error && <div className="text-red-400 mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/70 mb-2">Campaign Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-white/70 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white h-32"
                required
              />
            </div>
            <div>
              <label className="block text-white/70 mb-2">Goal (ETH)</label>
              <input
                type="number"
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                placeholder="0.0"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-white/70 mb-2">Duration (Days)</label>
              <input
                type="number"
                name="durationInDays"
                value={formData.durationInDays}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                placeholder="e.g. 7"
                min="1"
                step="1"
                required
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateCampaign; 