# Data Flow Diagram (DFD) for Charity DApp

## Level 0 (Context Diagram)
```
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|  User/Donor    |---->|  Charity DApp  |---->|  Blockchain    |
|                |     |                |     |  Network       |
|                |<----|                |<----|                |
+----------------+     +----------------+     +----------------+
```

## Level 1 (Main Processes)

```
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|  User/Donor    |---->|  Web3         |---->|  Smart         |
|                |     |  Interface    |     |  Contract      |
|                |<----|                |<----|                |
+----------------+     +----------------+     +----------------+
        |                      |                      |
        v                      v                      v
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|  Campaign      |<----|  Campaign      |<----|  Transaction   |
|  Data          |     |  Management    |     |  Data          |
|                |     |                |     |                |
+----------------+     +----------------+     +----------------+
```

## Detailed Data Flows

### 1. User Authentication Flow
- Input: User wallet address
- Process: MetaMask connection
- Output: Authenticated user session
- Data Store: User session state

### 2. Campaign Creation Flow
- Input: Campaign details (title, description, goal, deadline)
- Process: Campaign creation transaction
- Output: New campaign on blockchain
- Data Store: Smart contract storage

### 3. Donation Flow
- Input: Donation amount, campaign ID
- Process: ETH transfer transaction
- Output: Updated campaign balance
- Data Store: Smart contract balance

### 4. Campaign Management Flow
- Input: Campaign ID, action (withdraw/refund)
- Process: Smart contract function call
- Output: Updated campaign status
- Data Store: Smart contract state

## Data Stores

1. **Smart Contract Storage**
   - Campaign details
   - Donation records
   - Campaign balances
   - Creator addresses

2. **Frontend State**
   - User session
   - Campaign list
   - Transaction status
   - UI state

3. **Blockchain Network**
   - Transaction history
   - Contract state
   - Network status

## External Entities

1. **Users/Donors**
   - Input: Donation amounts, campaign interactions
   - Output: Transaction confirmations, campaign status

2. **Campaign Creators**
   - Input: Campaign details, withdrawal requests
   - Output: Campaign status, fund transfers

3. **Blockchain Network**
   - Input: Smart contract calls
   - Output: Transaction confirmations, state updates

## Process Descriptions

1. **Web3 Interface**
   - Handles user interactions
   - Manages MetaMask connection
   - Processes blockchain transactions

2. **Campaign Management**
   - Creates new campaigns
   - Updates campaign status
   - Processes donations
   - Handles withdrawals and refunds

3. **Transaction Processing**
   - Validates transactions
   - Executes smart contract functions
   - Updates blockchain state

## Data Flow Rules

1. All blockchain interactions must go through MetaMask
2. Campaign creation requires creator's wallet address
3. Donations must be in ETH
4. Withdrawals only possible after goal reached
5. Refunds automatic if goal not reached by deadline 