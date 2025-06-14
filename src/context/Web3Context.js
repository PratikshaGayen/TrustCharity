import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [network, setNetwork] = useState(null);

  const init = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        setProvider(provider);
        setNetwork(network);

        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        setContract(contract);

        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Error initializing:", error);
      }
    }
    setLoading(false);
  };

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaa36a7',
                chainName: 'Sepolia',
                nativeCurrency: {
                  name: 'SepoliaETH',
                  symbol: 'SEP',
                  decimals: 18
                },
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io']
              }
            ]
          });
        } catch (addError) {
          console.error("Error adding Sepolia network:", addError);
        }
      }
    }
  };

  useEffect(() => {
    init();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || null);
      });

      window.ethereum.on('chainChanged', (chainId) => {
        // Reload the page when the chain changes
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        
        // Check if we're on Sepolia
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        if (network.chainId !== 11155111) {
          await switchToSepolia();
        }
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const createCampaign = async (title, description, imageUrl, beneficiary, goal, durationInDays) => {
    try {
      const tx = await contract.createCampaign(
        title,
        description,
        beneficiary,
        ethers.utils.parseEther(goal.toString()),
        durationInDays
      );
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error creating campaign:", error);
      return false;
    }
  };

  const donate = async (campaignId, amount) => {
    try {
      const tx = await contract.donate(campaignId, {
        value: ethers.utils.parseEther(amount.toString())
      });
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error donating:", error);
      return false;
    }
  };

  const withdrawFunds = async (campaignId) => {
    try {
      const tx = await contract.withdrawFunds(campaignId);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      return false;
    }
  };

  const requestRefund = async (campaignId) => {
    try {
      const tx = await contract.requestRefund(campaignId);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error requesting refund:", error);
      return false;
    }
  };

  const getCampaign = async (campaignId) => {
    try {
      const campaign = await contract.getCampaign(campaignId);
      return {
        id: campaign.id.toNumber(),
        title: campaign.title,
        description: campaign.description,
        imageUrl: campaign.imageUrl || '',
        beneficiary: campaign.beneficiary,
        goal: ethers.utils.formatEther(campaign.goal),
        raised: ethers.utils.formatEther(campaign.raised),
        active: campaign.active,
        deadline: new Date(campaign.deadline.toNumber() * 1000),
        creator: campaign.creator || campaign.beneficiary // Fallback to beneficiary if creator is not available
      };
    } catch (error) {
      console.error("Error getting campaign:", error);
      return null;
    }
  };

  const getDonorAmount = async (campaignId, donor) => {
    try {
      const amount = await contract.getDonorAmount(campaignId, donor);
      return ethers.utils.formatEther(amount);
    } catch (error) {
      console.error("Error getting donor amount:", error);
      return "0";
    }
  };

  const getTotalCampaigns = async () => {
    try {
      const count = await contract.getTotalCampaigns();
      return count.toNumber();
    } catch (error) {
      console.error("Error getting total campaigns:", error);
      return 0;
    }
  };

  return (
    <Web3Context.Provider value={{
      account,
      contract,
      provider,
      loading,
      network,
      connectWallet,
      switchToSepolia,
      createCampaign,
      donate,
      withdrawFunds,
      requestRefund,
      getCampaign,
      getTotalCampaigns,
      getDonorAmount
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}; 