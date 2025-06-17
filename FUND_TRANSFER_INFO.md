# Fund Transfer Information

## Current Contract Behavior

### When Goal is Reached:
1. **Campaign Status**: Campaign is marked as `active = false`
2. **Event Emitted**: `CampaignCompleted` event is emitted
3. **Funds Status**: Funds remain locked in the smart contract
4. **Transfer Required**: Manual withdrawal is needed

### Fund Withdrawal Process:

#### Who Can Withdraw:
- **Campaign Creator**: The person who created the campaign
- **Beneficiary**: The address that will receive the funds

#### When Can Funds Be Withdrawn:
- Campaign is inactive (goal reached OR deadline passed)
- There are funds available to withdraw

#### How to Withdraw:
1. Navigate to the campaign details page
2. Click "Withdraw Funds" button (only visible to creator/beneficiary)
3. Confirm the transaction in MetaMask
4. Funds are automatically sent to the beneficiary address

### Important Notes:

#### For Campaign Creators:
- You can withdraw funds once the campaign ends
- Funds are sent to the beneficiary address you specified during campaign creation
- You cannot change the beneficiary address after campaign creation

#### For Beneficiaries:
- You can also withdraw funds if the creator hasn't done so
- Funds will be sent to your wallet address
- Make sure your wallet address is correct during campaign creation

#### For Donors:
- If goal is reached: Funds go to the beneficiary
- If goal is not reached: Donors can request refunds after deadline
- All transactions are transparent and verifiable on the blockchain

### Security Features:
- Only creator or beneficiary can withdraw funds
- Funds cannot be withdrawn while campaign is active
- All transactions are recorded on the blockchain
- No central authority can access the funds

### Future Improvements:
The contract could be enhanced to:
- Automatically transfer funds when goal is reached
- Add time-based automatic transfers
- Implement multi-signature requirements
- Add emergency withdrawal functions

## Current Implementation Status:
✅ Campaign creation and donation system working
✅ Goal tracking and campaign completion detection
✅ Manual withdrawal system for creator/beneficiary
✅ Real-time status updates in the UI
✅ Transparent transaction history

The system ensures that funds are secure and can only be accessed by authorized parties while maintaining full transparency for all participants. 