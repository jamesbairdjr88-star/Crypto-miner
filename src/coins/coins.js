const COINS = {
  bitcoin: {
    name: 'Bitcoin',
    symbol: 'BTC',
    algorithm: 'sha256',
    blockReward: 6.25,
    blockTime: 600,
    maxSupply: 21000000
  },
  litecoin: {
    name: 'Litecoin',
    symbol: 'LTC',
    algorithm: 'scrypt',
    blockReward: 12.5,
    blockTime: 150,
    maxSupply: 84000000
  },
  dogecoin: {
    name: 'Dogecoin',
    symbol: 'DOGE',
    algorithm: 'scrypt',
    blockReward: 10000,
    blockTime: 60,
    maxSupply: null
  },
  ethereum: {
    name: 'Ethereum',
    symbol: 'ETH',
    algorithm: 'ethash',
    blockReward: 2,
    blockTime: 15,
    maxSupply: null
  }
};

class CoinManager {
  static getCoin(coinName) {
    const coin = COINS[coinName.toLowerCase()];
    if (!coin) {
      throw new Error(`Unknown coin: ${coinName}`);
    }
    return coin;
  }

  static getAllCoins() {
    return COINS;
  }

  static isSupportedCoin(coinName) {
    return coinName.toLowerCase() in COINS;
  }

  static getAlgorithmForCoin(coinName) {
    const coin = this.getCoin(coinName);
    return coin.algorithm;
  }
}

module.exports = CoinManager;
