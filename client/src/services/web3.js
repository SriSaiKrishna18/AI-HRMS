import { ethers } from 'ethers';

// ── Contract Configuration ──────────────────────────────────
// Sepolia testnet chain ID
const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex

// TaskLogger deployed on Sepolia testnet
// Verified on Etherscan: https://sepolia.etherscan.io/address/0x2e2605F492B36b29F8388a610e180d46A8f5d77e
const CONTRACT_ADDRESS = '0x2e2605F492B36b29F8388a610e180d46A8f5d77e';

// ABI for TaskLogger contract (matches TaskLogger.sol)
const CONTRACT_ABI = [
    'function logTaskCompletion(address employee, uint256 taskId) external',
    'function isTaskLogged(uint256 taskId) external view returns (bool)',
    'function totalTasksLogged() external view returns (uint256)',
    'function taskLogged(uint256) external view returns (bool)',
    'event TaskCompleted(address indexed employee, uint256 indexed taskId, uint256 timestamp, address indexed organization)'
];

// Fallback: burn address for when contract is not yet deployed
const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD';

class Web3Service {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.contract = null;
    }

    // Check if MetaMask is available
    isMetaMaskInstalled() {
        return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
    }

    // Check if contract is deployed (non-zero address)
    isContractDeployed() {
        return CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000';
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

            // Initialize contract if deployed
            if (this.isContractDeployed()) {
                this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);
            }

            return {
                address: this.address,
                network: 'Sepolia Testnet',
                contractDeployed: this.isContractDeployed()
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

        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (!accounts || accounts.length === 0) {
            const reqAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.address = reqAccounts[0];
        } else {
            this.address = accounts[0];
        }

        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        await this.switchToSepolia();

        // Re-initialize contract with fresh signer
        if (this.isContractDeployed()) {
            this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);
        }

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
    // Uses smart contract if deployed, falls back to data-encoded transaction
    async logTaskOnChain(employeeAddress, taskId) {
        await this.ensureConnected();

        if (!this.signer) {
            throw new Error('Wallet not connected.');
        }

        try {
            let tx, receipt;

            if (this.isContractDeployed() && this.contract) {
                // ── Method 1: Smart Contract Call ──────────────────────
                // Call logTaskCompletion on the deployed TaskLogger contract
                const empAddr = employeeAddress && ethers.isAddress(employeeAddress)
                    ? employeeAddress
                    : this.address; // Fallback to connected wallet

                tx = await this.contract.logTaskCompletion(empAddr, taskId);
                receipt = await tx.wait();

                return {
                    txHash: receipt.hash,
                    blockNumber: receipt.blockNumber,
                    explorerUrl: `https://sepolia.etherscan.io/tx/${receipt.hash}`,
                    method: 'smart_contract',
                    contractAddress: CONTRACT_ADDRESS
                };
            } else {
                // ── Method 2: Fallback – Data-encoded transaction ─────
                const data = ethers.hexlify(
                    ethers.toUtf8Bytes(
                        JSON.stringify({
                            type: 'RizeOS_TaskCompletion',
                            employeeId: employeeAddress,
                            taskId,
                            timestamp: Date.now()
                        })
                    )
                );

                tx = await this.signer.sendTransaction({
                    to: BURN_ADDRESS,
                    value: ethers.parseEther('0'),
                    data: data
                });

                receipt = await tx.wait();

                return {
                    txHash: receipt.hash,
                    blockNumber: receipt.blockNumber,
                    explorerUrl: `https://sepolia.etherscan.io/tx/${receipt.hash}`,
                    method: 'data_encoded',
                    contractAddress: null
                };
            }
        } catch (err) {
            if (err.code === 'ACTION_REJECTED') {
                throw new Error('Transaction rejected by user.');
            }
            throw err;
        }
    }

    // Log payroll proof on-chain
    async logPayrollOnChain(employeeAddress, amount, period) {
        await this.ensureConnected();

        if (!this.signer) {
            throw new Error('Wallet not connected.');
        }

        try {
            const data = ethers.hexlify(
                ethers.toUtf8Bytes(
                    JSON.stringify({
                        type: 'RizeOS_PayrollProof',
                        employee: employeeAddress,
                        amount,
                        period,
                        timestamp: Date.now(),
                        verified: true
                    })
                )
            );

            const tx = await this.signer.sendTransaction({
                to: BURN_ADDRESS,
                value: ethers.parseEther('0'),
                data: data
            });

            const receipt = await tx.wait();

            return {
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                explorerUrl: `https://sepolia.etherscan.io/tx/${receipt.hash}`,
                type: 'payroll_proof'
            };
        } catch (err) {
            if (err.code === 'ACTION_REJECTED') {
                throw new Error('Transaction rejected by user.');
            }
            throw err;
        }
    }

    // Check if task is already logged on-chain (requires contract)
    async isTaskLoggedOnChain(taskId) {
        if (!this.isContractDeployed()) return false;

        try {
            await this.ensureConnected();
            return await this.contract.isTaskLogged(taskId);
        } catch {
            return false;
        }
    }

    // Get total tasks logged on-chain (requires contract)
    async getTotalTasksLogged() {
        if (!this.isContractDeployed()) return 0;

        try {
            await this.ensureConnected();
            const total = await this.contract.totalTasksLogged();
            return Number(total);
        } catch {
            return 0;
        }
    }

    // Get wallet balance
    async getBalance() {
        try {
            await this.ensureConnected();
            const balance = await this.provider.getBalance(this.address);
            return ethers.formatEther(balance);
        } catch {
            return '0';
        }
    }

    // Get network name
    async getNetwork() {
        try {
            if (!this.provider) return null;
            const network = await this.provider.getNetwork();
            return network.name;
        } catch {
            return null;
        }
    }

    // Disconnect
    disconnect() {
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.contract = null;
    }

    // Get current address
    getAddress() {
        return this.address;
    }

    // Get shortened address for display
    getShortAddress() {
        if (!this.address) return null;
        return `${this.address.slice(0, 6)}...${this.address.slice(-4)}`;
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
