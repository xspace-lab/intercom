/**
 * IntercomSwap Integration for Trac Network
 * Real API integration with Trac wallet signatures
 * GitHub: https://github.com/Trac-Systems/intercomswap-agent
 */

class IntercomSwapTrac {
  constructor(config = {}) {
    this.apiUrl = config.apiUrl || 'https://api.intercomswap.trac.network/v1';
    this.tracWallet = null;
    
    // Supported chains
    this.chains = {
      trac: { id: 'trac-1', name: 'Trac Network', gasPrice: 0 },
      ethereum: { id: 1, name: 'Ethereum', gasPrice: 15 },
      polygon: { id: 137, name: 'Polygon', gasPrice: 0.02 },
      ronin: { id: 2020, name: 'Ronin', gasPrice: 0 },
      immutablex: { id: 0, name: 'ImmutableX', gasPrice: 0 },
      solana: { id: 0, name: 'Solana', gasPrice: 0.000005 }
    };
  }
  
  /**
   * Initialize with Trac wallet instance
   */
  setWallet(tracWalletInstance) {
    this.tracWallet = tracWalletInstance;
  }
  
  /**
   * Get swap quote for NFT/token
   */
  async getQuote(params) {
    const {
      assetType,      // 'nft' or 'token'
      assetAddress,   // Contract address
      tokenId,        // For NFTs
      fromChain,      // Source chain
      toChain,        // Destination chain (default: trac)
      toToken,        // Target token (USDC, USDT, TRAC)
      amount          // For tokens
    } = params;
    
    try {
      // Sign request with Trac wallet
      const signature = await this.signRequest({
        method: 'getQuote',
        params: params,
        timestamp: Date.now()
      });
      
      const response = await fetch(`${this.apiUrl}/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature.signature,
          'X-Public-Key': signature.publicKey
        },
        body: JSON.stringify({
          asset_type: assetType,
          asset_address: assetAddress,
          token_id: tokenId,
          from_chain: fromChain,
          to_chain: toChain || 'trac',
          to_token: toToken || 'TRAC',
          amount: amount,
          user_address: this.tracWallet.address
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Quote request failed');
      }
      
      const quote = await response.json();
      
      return {
        quoteId: quote.quote_id,
        route: this.parseRoute(quote.route),
        estimatedOutput: parseFloat(quote.estimated_output),
        priceImpact: parseFloat(quote.price_impact),
        platformFee: parseFloat(quote.platform_fee),
        gasFee: parseFloat(quote.gas_fee),
        totalFee: parseFloat(quote.total_fee),
        netReceive: parseFloat(quote.net_receive),
        executionTime: quote.execution_time,
        expiresAt: new Date(quote.expires_at),
        steps: quote.steps
      };
      
    } catch (error) {
      console.error('IntercomSwap quote error:', error);
      throw error;
    }
  }
  
  /**
   * Execute swap with Trac wallet
   */
  async executeSwap(quoteId, options = {}) {
    if (!this.tracWallet || !this.tracWallet.connected) {
      throw new Error('Trac wallet not connected');
    }
    
    try {
      // Get execution details
      const signature = await this.signRequest({
        method: 'executeSwap',
        quoteId: quoteId,
        timestamp: Date.now()
      });
      
      const response = await fetch(`${this.apiUrl}/swap/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature.signature,
          'X-Public-Key': signature.publicKey
        },
        body: JSON.stringify({
          quote_id: quoteId,
          user_address: this.tracWallet.address,
          slippage_tolerance: options.slippageTolerance || 0.5
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Swap execution failed');
      }
      
      const execution = await response.json();
      
      // Execute transactions via Trac wallet
      const txHashes = [];
      
      for (const tx of execution.transactions) {
        const result = await this.tracWallet.sendTransaction({
          to: tx.to,
          amount: tx.value || '0',
          data: JSON.stringify(tx.data),
          gas: tx.gas || 'auto'
        });
        
        txHashes.push(result.txHash);
        
        // Wait for confirmation
        await this.waitForConfirmation(result.txHash);
      }
      
      // Get final status
      const finalStatus = await this.getSwapStatus(execution.swap_id);
      
      return {
        swapId: execution.swap_id,
        status: finalStatus.status,
        txHashes: txHashes,
        received: finalStatus.received,
        token: finalStatus.token,
        chain: finalStatus.chain
      };
      
    } catch (error) {
      console.error('IntercomSwap execution error:', error);
      throw error;
    }
  }
  
  /**
   * Get swap status
   */
  async getSwapStatus(swapId) {
    try {
      const response = await fetch(`${this.apiUrl}/swap/${swapId}`, {
        headers: {
          'X-User-Address': this.tracWallet.address
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get swap status');
      }
      
      const status = await response.json();
      
      return {
        swapId: swapId,
        status: status.status, // 'pending', 'processing', 'completed', 'failed'
        progress: status.progress,
        currentStep: status.current_step,
        txHashes: status.tx_hashes,
        received: status.received,
        token: status.token,
        chain: status.chain,
        error: status.error
      };
      
    } catch (error) {
      console.error('Status check error:', error);
      throw error;
    }
  }
  
  /**
   * Get supported assets
   */
  async getSupportedAssets(chain) {
    try {
      const response = await fetch(`${this.apiUrl}/assets?chain=${chain}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch supported assets');
      }
      
      const data = await response.json();
      return data.assets;
      
    } catch (error) {
      console.error('Asset fetch error:', error);
      throw error;
    }
  }
  
  /**
   * Get price for asset
   */
  async getAssetPrice(assetAddress, chain = 'trac') {
    try {
      const response = await fetch(
        `${this.apiUrl}/price?asset=${assetAddress}&chain=${chain}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to get price');
      }
      
      const data = await response.json();
      return {
        price: parseFloat(data.price),
        priceUSD: parseFloat(data.price_usd),
        change24h: parseFloat(data.change_24h)
      };
      
    } catch (error) {
      console.error('Price fetch error:', error);
      throw error;
    }
  }
  
  /**
   * Sign request with Trac wallet
   */
  async signRequest(data) {
    if (!this.tracWallet || !this.tracWallet.connected) {
      throw new Error('Wallet not connected');
    }
    
    const message = JSON.stringify(data);
    
    const result = await window.trac.request({
      method: 'wallet_signMessage',
      params: { message }
    });
    
    return {
      signature: result.signature,
      publicKey: result.publicKey
    };
  }
  
  /**
   * Wait for transaction confirmation
   */
  async waitForConfirmation(txHash, maxAttempts = 60) {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        const status = await this.tracWallet.getTransactionStatus(txHash);
        
        if (status.status === 'confirmed') {
          return true;
        } else if (status.status === 'failed') {
          throw new Error('Transaction failed');
        }
      } catch (error) {
        console.warn('Status check attempt', i, error.message);
      }
    }
    
    throw new Error('Transaction timeout');
  }
  
  /**
   * Parse route into human-readable steps
   */
  parseRoute(route) {
    if (typeof route === 'string') {
      return route.split(' → ').filter(Boolean);
    }
    
    if (Array.isArray(route)) {
      return route.map(step => step.description || step);
    }
    
    return ['Direct swap'];
  }
  
  /**
   * Calculate estimated fees
   */
  calculateFees(inputValue, fromChain, toChain) {
    const platformFeeRate = 0.015; // 1.5%
    const platformFee = inputValue * platformFeeRate;
    
    const fromGas = this.chains[fromChain]?.gasPrice || 0;
    const toGas = this.chains[toChain]?.gasPrice || 0;
    const totalGas = fromGas + toGas;
    
    const totalFee = platformFee + totalGas;
    const netOutput = Math.max(0, inputValue - totalFee);
    
    return {
      platformFee,
      gasFee: totalGas,
      totalFee,
      netOutput
    };
  }
  
  /**
   * Estimate swap for preview (no API call)
   */
  estimateSwap(params) {
    const {
      inputValue,
      fromChain = 'trac',
      toChain = 'trac',
      assetName = 'Asset'
    } = params;
    
    const fees = this.calculateFees(inputValue, fromChain, toChain);
    
    const steps = [];
    
    // Step 1: List/Prepare asset
    steps.push(`List ${assetName} on ${this.chains[fromChain].name}`);
    
    // Step 2: Bridge if cross-chain
    if (fromChain !== toChain && fromChain !== 'trac' && toChain !== 'trac') {
      steps.push(`Bridge ${fromChain} → trac → ${toChain}`);
    } else if (fromChain !== toChain) {
      steps.push(`Bridge ${fromChain} → ${toChain}`);
    }
    
    // Step 3: Swap to target token
    steps.push(`Swap to ${params.toToken || 'TRAC'} via IntercomSwap`);
    
    // Step 4: Receive
    steps.push(`Receive ${params.toToken || 'TRAC'} on ${this.chains[toChain].name}`);
    
    return {
      input: inputValue,
      ...fees,
      route: steps,
      estimatedTime: fromChain === toChain ? '<2 seconds' : '5-30 seconds',
      fromChain: this.chains[fromChain].name,
      toChain: this.chains[toChain].name
    };
  }
  
  /**
   * Format currency
   */
  formatCurrency(amount, decimals = 2) {
    return parseFloat(amount).toFixed(decimals);
  }
  
  /**
   * Format time estimate
   */
  formatTime(seconds) {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    return `${Math.floor(seconds / 3600)} hours`;
  }
}

// Export
window.IntercomSwapTrac = IntercomSwapTrac;
