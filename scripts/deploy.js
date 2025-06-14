const hre = require("hardhat");

async function main() {
  const Charity = await hre.ethers.getContractFactory("Charity");
  const charity = await Charity.deploy();

  await charity.deployed();

  console.log("Charity contract deployed to:", charity.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 