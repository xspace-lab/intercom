/**
 * Trac Network Wallet Integration
 * Official docs: https://docs.trac.network/documentation/developers/mainnet/wallet-api
 */

class TracWallet {
  constructor() {
    this.connected = false;
    this.address = null;
    this.balance = null;
    this.network = null;
    
    // Check if Trac wallet is available
    this.isAvailable = typeof window.trac !== 'undefined';
  }
  
  /**
   * Check if Trac wallet extension is installed
   */
  isInstalled() {
    return this.isAvailable;
  }
  
  /**
   * Connect to Trac wallet
   */
  async connect() {
    if (!this.isAvailable) {
      throw new Error('Trac wallet not installed. Get it at: https://trac.network/wallet');
    }
    
    try {
      // Request connection
      const response = await window.trac.request({
        method: 'wallet_connect',
        params: {}
      });
      
      if (response.success) {
        this.connected = true;
        this.address = response.address;
        this.network = response.network;
        
        // Get balance
        await this.updateBalance();
        
        // Setup event listeners
        this.setupListeners();
        
        console.log('✅ Connected to Trac wallet:', this.address);
        
        return {
          address: this.address,
          network: this.network,
          balance: this.balance
        };
      } else {
        throw new Error(response.error || 'Connection rejected');
      }
      
    } catch (error) {
      console.error('Trac wallet connection error:', error);
      throw error;
    }
  }
  
  /**
   * Disconnect from wallet
   */
  async disconnect() {
    try {
      await window.trac.request({
        method: 'wallet_disconnect',
        params: {}
      });
      
      this.connected = false;
      this.address = null;
      this.balance = null;
      this.network = null;
      
      console.log('🔌 Disconnected from Trac wallet');
      
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }
  
  /**
   * Get wallet balance
   */
  async updateBalance() {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const response = await window.trac.request({
        method: 'wallet_getBalance',
        params: {
          address: this.address
        }
      });
      
      if (response.success) {
        this.balance = response.balance;
        return this.balance;
      } else {
        throw new Error(response.error || 'Failed to get balance');
      }
      
    } catch (error) {
      console.error('Balance fetch error:', error);
      throw error;
    }
  }
  
  /**
   * Get account info
   */
  async getAccountInfo() {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const response = await window.trac.request({
        method: 'wallet_getAccountInfo',
        params: {
          address: this.address
        }
      });
      
      if (response.success) {
        return {
          address: response.address,
          balance: response.balance,
          network: response.network,
          publicKey: response.publicKey
        };
      } else {
        throw new Error(response.error || 'Failed to get account info');
      }
      
    } catch (error) {
      console.error('Account info error:', error);
      throw error;
    }
  }
  
  /**
   * Sign transaction
   */
  async signTransaction(transaction) {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const response = await window.trac.request({
        method: 'wallet_signTransaction',
        params: {
          transaction: transaction
        }
      });
      
      if (response.success) {
        return {
          signature: response.signature,
          signedTransaction: response.signedTransaction
        };
      } else {
        throw new Error(response.error || 'Transaction signing failed');
      }
      
    } catch (error) {
      console.error('Transaction signing error:', error);
      throw error;
    }
  }
  
  /**
   * Send transaction
   */
  async sendTransaction(transaction) {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const response = await window.trac.request({
        method: 'wallet_sendTransaction',
        params: {
          to: transaction.to,
          amount: transaction.amount,
          data: transaction.data || '',
          gas: transaction.gas || 'auto'
        }
      });
      
      if (response.success) {
        return {
          txHash: response.txHash,
          status: 'pending'
        };
      } else {
        throw new Error(response.error || 'Transaction failed');
      }
      
    } catch (error) {
      console.error('Send transaction error:', error);
      throw error;
    }
  }
  
  /**
   * Get transaction status
   */
  async getTransactionStatus(txHash) {
    try {
      const response = await window.trac.request({
        method: 'wallet_getTransactionStatus',
        params: {
          txHash: txHash
        }
      });
      
      if (response.success) {
        return {
          txHash: txHash,
          status: response.status, // 'pending', 'confirmed', 'failed'
          confirmations: response.confirmations,
          blockNumber: response.blockNumber
        };
      } else {
        throw new Error(response.error || 'Failed to get status');
      }
      
    } catch (error) {
      console.error('Status check error:', error);
      throw error;
    }
  }
  
  /**
   * Switch network
   */
  async switchNetwork(networkId) {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const response = await window.trac.request({
        method: 'wallet_switchNetwork',
        params: {
          networkId: networkId // 'mainnet', 'testnet'
        }
      });
      
      if (response.success) {
        this.network = response.network;
        console.log('✅ Switched to network:', this.network);
        return this.network;
      } else {
        throw new Error(response.error || 'Network switch failed');
      }
      
    } catch (error) {
      console.error('Network switch error:', error);
      throw error;
    }
  }
  
  /**
   * Sign message
   */
  async signMessage(message) {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const response = await window.trac.request({
        method: 'wallet_signMessage',
        params: {
          message: message
        }
      });
      
      if (response.success) {
        return {
          signature: response.signature,
          publicKey: response.publicKey
        };
      } else {
        throw new Error(response.error || 'Message signing failed');
      }
      
    } catch (error) {
      console.error('Message signing error:', error);
      throw error;
    }
  }
  
  /**
   * Verify signature
   */
  async verifySignature(message, signature, publicKey) {
    try {
      const response = await window.trac.request({
        method: 'wallet_verifySignature',
        params: {
          message: message,
          signature: signature,
          publicKey: publicKey
        }
      });
      
      if (response.success) {
        return response.valid;
      } else {
        throw new Error(response.error || 'Verification failed');
      }
      
    } catch (error) {
      console.error('Signature verification error:', error);
      throw error;
    }
  }
  
  /**
   * Setup event listeners
   */
  setupListeners() {
    if (!window.trac) return;
    
    // Account changed
    window.trac.on('accountChanged', (account) => {
      console.log('Account changed:', account);
      this.address = account.address;
      this.balance = account.balance;
      
      window.dispatchEvent(new CustomEvent('tracAccountChanged', {
        detail: { address: this.address, balance: this.balance }
      }));
    });
    
    // Network changed
    window.trac.on('networkChanged', (network) => {
      console.log('Network changed:', network);
      this.network = network;
      
      window.dispatchEvent(new CustomEvent('tracNetworkChanged', {
        detail: { network: this.network }
      }));
    });
    
    // Disconnected
    window.trac.on('disconnect', () => {
      console.log('Wallet disconnected');
      this.connected = false;
      this.address = null;
      this.balance = null;
      
      window.dispatchEvent(new CustomEvent('tracDisconnected'));
    });
  }
  
  /**
   * Get network info
   */
  getNetworkInfo() {
    const networks = {
      'mainnet': {
        name: 'Trac Network Mainnet',
        chainId: 'trac-1',
        rpcUrl: 'https://rpc.trac.network',
        explorerUrl: 'https://explorer.trac.network'
      },
      'testnet': {
        name: 'Trac Network Testnet',
        chainId: 'trac-testnet-1',
        rpcUrl: 'https://testnet-rpc.trac.network',
        explorerUrl: 'https://testnet-explorer.trac.network'
      }
    };
    
    return networks[this.network] || networks['mainnet'];
  }
  
  /**
   * Format address for display
   */
  formatAddress(address = null) {
    const addr = address || this.address;
    if (!addr) return '0x0000...0000';
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  }
  
  /**
   * Format balance for display
   */
  formatBalance(balance = null) {
    const bal = balance || this.balance;
    if (!bal) return '0.00';
    
    // Assuming balance is in smallest unit
    const decimals = 18; // Standard decimals for Trac tokens
    const formatted = parseFloat(bal) / Math.pow(10, decimals);
    
    return formatted.toFixed(4);
  }
}

// Export singleton instance
window.TracWallet = TracWallet;
