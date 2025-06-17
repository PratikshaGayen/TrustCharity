# TrustCharity Deployment Guide

## Frontend Deployment (Vercel)

The frontend is configured to deploy on Vercel without any issues. The `package.json` has been cleaned to only include frontend dependencies.

### Automatic Deployment
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect it's a React app
3. Build command: `npm run build`
4. Output directory: `build`

### Manual Deployment
```bash
npm install
npm run build
```

## Smart Contract Deployment (Local Development)

For smart contract development and deployment, use the development package:

### Setup Development Environment
```bash
# Copy development package
cp package.dev.json package.json

# Install dependencies
npm install

# Create .env file with your credentials
echo "SEPOLIA_RPC_URL=your_sepolia_rpc_url" > .env
echo "PRIVATE_KEY=your_private_key" >> .env
```

### Deploy to Sepolia
```bash
# Compile contracts
npm run compile

# Deploy to Sepolia
npm run deploy:sepolia
```

### Update Frontend Contract Address
After deployment, update the contract address in:
```
src/config/contract.js
```

## Environment Variables

### Frontend (.env)
```
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address
REACT_APP_NETWORK_ID=11155111  # Sepolia
```

### Development (.env)
```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

## Troubleshooting

### Vercel Build Issues
- Ensure only frontend dependencies are in `package.json`
- Remove any Hardhat-related packages from production build
- Use `package.dev.json` for local development

### Contract Deployment Issues
- Check your .env file has correct credentials
- Ensure you have enough Sepolia ETH for gas fees
- Verify your RPC URL is working

## File Structure
```
charity/
├── src/                    # Frontend source code
├── contracts/              # Smart contracts
├── scripts/                # Deployment scripts
├── package.json            # Production dependencies
├── package.dev.json        # Development dependencies
├── hardhat.config.js       # Hardhat configuration
└── .env                    # Environment variables
``` 