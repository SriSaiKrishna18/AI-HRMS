import { ethers } from 'ethers';

// Sepolia testnet chain ID
const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex

// Simple smart contract ABI for task logging
// If no contract deployed, we fall back to a simple transaction
const TASK_LOGGER_ABI = [
    'function logTaskCompletion(address employee, uint256 taskId) external',
    'event TaskCompleted(address indexed employee, uint256 indexed taskId, uint256 timestamp)'
];

class Web3Service {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.contractAddress = null; // Set after deploying
    }

    // Check if MetaMask is available
    isMetaMaskInstalled() {
        return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
    }

    // Connect MetaMask wallet
    async connectWallet() {
        if (!this.isMetaMaskInstalled()) {
            throw new Error('MetaMask is not installed. Please install MetaMask to use Web3 features.');
        }

        try {
            // Request accounts
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Create provider and signer
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.signer = await this.provider.getSigner();
            this.address = accounts[0];

            // Switch to Sepolia if needed
            await this.switchToSepolia();

            return {
                address: this.address,
                network: 'Sepolia Testnet'
            };
        } catch (err) {
            if (err.code === 4001) {
                throw new Error('Connection rejected by user.');
            }
            throw err;
        }
    }

    // Switch to Sepolia testnet
    async switchToSepolia() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: SEPOLIA_CHAIN_ID }]
            });
        } catch (err) {
            // If Sepolia not added, add it
            if (err.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: SEPOLIA_CHAIN_ID,
                        chainName: 'Sepolia Testnet',
                        nativeCurrency: { name: 'Sepolia ETH', symbol: 'SEP', decimals: 18 },
                        rpcUrls: ['https://sepolia.infura.io/v3/'],
                        blockExplorerUrls: ['https://sepolia.etherscan.io']
                    }]
                });
            }
        }
    }

    // Log task completion on-chain (simple transaction with data payload)
    async logTaskOnChain(employeeId, taskId) {
        if (!this.signer) {
            throw new Error('Wallet not connected.');
        }

        try {
            // Encode task data as hex in the transaction data field
            const data = ethers.hexlify(
                ethers.toUtf8Bytes(
                    JSON.stringify({
                        type: 'RizeOS_TaskCompletion',
                        employeeId,
                        taskId,
                        timestamp: Date.now()
                    })
                )
            );

            // Send a minimal transaction to self with task data
            const tx = await this.signer.sendTransaction({
                to: this.address, // send to self
                value: 0,
                data: data
            });

            // Wait for confirmation
            const receipt = await tx.wait();

            return {
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                explorerUrl: `https://sepolia.etherscan.io/tx/${receipt.hash}`
            };
        } catch (err) {
            if (err.code === 'ACTION_REJECTED') {
                throw new Error('Transaction rejected by user.');
            }
            throw err;
        }
    }

    // Disconnect
    disconnect() {
        this.provider = null;
        this.signer = null;
        this.address = null;
    }

    // Get current address
    getAddress() {
        return this.address;
    }

    // Listen for account changes
    onAccountsChanged(callback) {
        if (this.isMetaMaskInstalled()) {
            window.ethereum.on('accountsChanged', callback);
        }
    }

    // Listen for chain changes
    onChainChanged(callback) {
        if (this.isMetaMaskInstalled()) {
            window.ethereum.on('chainChanged', callback);
        }
    }
}

// Singleton instance
const web3Service = new Web3Service();
export default web3Service;
