const { ethers } = require("hardhat");

async function main() {
  // Get the contract factory
  const Charity = await ethers.getContractFactory("Charity");
  
  // Deploy the contract
  console.log("Deploying Charity contract...");
  const charity = await Charity.deploy();

  // Wait for deployment to finish
  await charity.deployed();

  console.log("Charity contract deployed to:", charity.address);
  console.log("Deployment transaction hash:", charity.deployTransaction.hash);
  
  // Save the contract address to a file for easy access
  const fs = require('fs');
  const deploymentInfo = {
    contractAddress: charity.address,
    network: 'sepolia',
    deployer: charity.deployTransaction.from,
    transactionHash: charity.deployTransaction.hash,
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  }); 