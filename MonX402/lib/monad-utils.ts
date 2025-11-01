/**
 * Monad Blockchain Utilities
 * 
 * Helper functions for interacting with Monad testnet (EVM-compatible)
 */

import { ethers, Wallet, HDNodeWallet, JsonRpcProvider, TransactionRequest, TransactionResponse } from 'ethers';

// Monad Testnet Configuration
export const MONAD_TESTNET_RPC = 'https://testnet-rpc.monad.xyz';
export const MONAD_TESTNET_CHAIN_ID = 10143; // Monad testnet chain ID
export const MONAD_TESTNET_EXPLORER = 'https://testnet-explorer.monad.xyz';

// Network configuration
export interface MonadNetworkConfig {
  rpcUrl: string;
  chainId: number;
  explorer: string;
}

export const MONAD_NETWORKS: Record<string, MonadNetworkConfig> = {
  testnet: {
    rpcUrl: MONAD_TESTNET_RPC,
    chainId: MONAD_TESTNET_CHAIN_ID,
    explorer: MONAD_TESTNET_EXPLORER,
  },
  // Mainnet will be added when available
};

/**
 * Get Monad network configuration
 */
export function getMonadNetwork(network: 'testnet' | 'mainnet' = 'testnet'): MonadNetworkConfig {
  const config = MONAD_NETWORKS[network];
  if (!config) {
    throw new Error(`Unsupported Monad network: ${network}`);
  }
  return config;
}

/**
 * Create a Monad provider
 */
export function createMonadProvider(network: 'testnet' | 'mainnet' = 'testnet'): JsonRpcProvider {
  const config = getMonadNetwork(network);
  return new JsonRpcProvider(config.rpcUrl, config.chainId);
}

/**
 * Create a Monad wallet from private key
 */
export function createMonadWallet(privateKey: string, network: 'testnet' | 'mainnet' = 'testnet'): Wallet {
  const provider = createMonadProvider(network);
  
  // Ensure private key has 0x prefix
  const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  
  return new Wallet(formattedKey, provider);
}

/**
 * Build a native token transfer transaction
 */
export async function buildTransferTransaction(
  from: string,
  to: string,
  amount: string, // Amount in wei
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<TransactionRequest> {
  const provider = createMonadProvider(network);
  
  // Get current gas price and nonce
  const feeData = await provider.getFeeData();
  const nonce = await provider.getTransactionCount(from, 'pending');
  
  const tx: TransactionRequest = {
    from,
    to,
    value: amount,
    nonce,
    gasLimit: 21000, // Standard gas limit for ETH transfer
    maxFeePerGas: feeData.maxFeePerGas || undefined,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || undefined,
    chainId: getMonadNetwork(network).chainId,
    type: 2, // EIP-1559 transaction
  };
  
  return tx;
}

/**
 * Sign a transaction
 */
export async function signTransaction(
  wallet: Wallet,
  transaction: TransactionRequest
): Promise<string> {
  const signedTx = await wallet.signTransaction(transaction);
  return signedTx;
}

/**
 * Submit a signed transaction to the blockchain
 */
export async function submitTransaction(
  signedTransaction: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<TransactionResponse> {
  const provider = createMonadProvider(network);
  const tx = await provider.broadcastTransaction(signedTransaction);
  return tx;
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  txHash: string,
  network: 'testnet' | 'mainnet' = 'testnet',
  confirmations: number = 1
): Promise<ethers.TransactionReceipt | null> {
  const provider = createMonadProvider(network);
  const receipt = await provider.waitForTransaction(txHash, confirmations);
  return receipt;
}

/**
 * Verify a transaction on-chain
 */
export async function verifyTransaction(
  txHash: string,
  expectedRecipient: string,
  expectedAmount: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<{
  valid: boolean;
  reason?: string;
  transaction?: ethers.TransactionResponse;
}> {
  try {
    const provider = createMonadProvider(network);
    const tx = await provider.getTransaction(txHash);
    
    if (!tx) {
      return { valid: false, reason: 'Transaction not found' };
    }
    
    // Verify recipient
    if (tx.to?.toLowerCase() !== expectedRecipient.toLowerCase()) {
      return { 
        valid: false, 
        reason: `Recipient mismatch: expected ${expectedRecipient}, got ${tx.to}` 
      };
    }
    
    // Verify amount
    if (tx.value.toString() !== expectedAmount) {
      return { 
        valid: false, 
        reason: `Amount mismatch: expected ${expectedAmount}, got ${tx.value.toString()}` 
      };
    }
    
    return { valid: true, transaction: tx };
  } catch (error) {
    return { 
      valid: false, 
      reason: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Parse a signed transaction to extract details
 */
export function parseSignedTransaction(signedTx: string): ethers.Transaction {
  return ethers.Transaction.from(signedTx);
}

/**
 * Get account balance
 */
export async function getBalance(
  address: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<bigint> {
  const provider = createMonadProvider(network);
  return await provider.getBalance(address);
}

/**
 * Format wei to MON (Monad native token)
 */
export function formatMON(wei: bigint | string): string {
  return ethers.formatEther(wei);
}

/**
 * Parse MON to wei
 */
export function parseMON(mon: string): bigint {
  return ethers.parseEther(mon);
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerUrl(txHash: string, network: 'testnet' | 'mainnet' = 'testnet'): string {
  const config = getMonadNetwork(network);
  return `${config.explorer}/tx/${txHash}`;
}

/**
 * Get explorer URL for address
 */
export function getAddressExplorerUrl(address: string, network: 'testnet' | 'mainnet' = 'testnet'): string {
  const config = getMonadNetwork(network);
  return `${config.explorer}/address/${address}`;
}

/**
 * Generate a new random wallet
 */
export function generateWallet(network: 'testnet' | 'mainnet' = 'testnet'): HDNodeWallet {
  const provider = createMonadProvider(network);
  const randomWallet = Wallet.createRandom();
  return randomWallet.connect(provider);
}

/**
 * Validate Ethereum/Monad address
 */
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

/**
 * Validate private key format
 */
export function isValidPrivateKey(privateKey: string): boolean {
  try {
    const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    new Wallet(formattedKey);
    return true;
  } catch {
    return false;
  }
}
