require("dotenv").config();
const path = require('path');
const fs = require('fs');

console.log("Current working directory:", process.cwd());
console.log("Checking for .env file...");

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    console.log(".env file exists at:", envPath);
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log("\n.env file contents (masked):");
    envContent.split('\n').forEach(line => {
        if (line.includes('PRIVATE_KEY')) {
            console.log('PRIVATE_KEY=******');
        } else if (line.includes('SEPOLIA_RPC_URL')) {
            console.log('SEPOLIA_RPC_URL=******');
        } else {
            console.log(line);
        }
    });
} else {
    console.log("ERROR: .env file not found!");
}

console.log("\nChecking environment variables...");
console.log("SEPOLIA_RPC_URL:", process.env.SEPOLIA_RPC_URL ? "Set" : "Not set");
console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY ? "Set" : "Not set");

if (!process.env.SEPOLIA_RPC_URL || !process.env.PRIVATE_KEY) {
    console.log("\nERROR: Missing required environment variables!");
    console.log("Please make sure your .env file contains:");
    console.log("SEPOLIA_RPC_URL=your-sepolia-rpc-url");
    console.log("PRIVATE_KEY=your-private-key");
} 