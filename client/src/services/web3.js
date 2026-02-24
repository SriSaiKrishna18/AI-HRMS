import { ethers } from 'ethers';

// Sepolia testnet chain ID
const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex

class Web3Service {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.address = null;
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
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
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

    // Ensure wallet is connected and signer is fresh
    async ensureConnected() {
        if (!this.isMetaMaskInstalled()) {
            throw new Error('MetaMask is not installed.');
        }

        // Always re-create provider and signer to handle page navigation
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (!accounts || accounts.length === 0) {
            // Need user approval
            const reqAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.address = reqAccounts[0];
        } else {
            this.address = accounts[0];
        }

        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        await this.switchToSepolia();

        return this.signer;
    }

    // Switch to Sepolia testnet
    async switchToSepolia() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: SEPOLIA_CHAIN_ID }]
            });
        } catch (err) {
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

    // Log task completion on-chain
    async logTaskOnChain(employeeId, taskId) {
        // Auto-reconnect: ensure signer is fresh
        await this.ensureConnected();

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

            // Send to burn address with task data (MetaMask blocks data to self)
            const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD';
            const tx = await this.signer.sendTransaction({
                to: BURN_ADDRESS,
                value: ethers.parseEther('0'),
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

const web3Service = new Web3Service();
export default web3Service;
