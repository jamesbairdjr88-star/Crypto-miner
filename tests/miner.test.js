const SHA256Algorithm = require('../src/algorithms/sha256');
const ScryptAlgorithm = require('../src/algorithms/scrypt');
const CoinManager = require('../src/coins/coins');

describe('SHA256Algorithm', () => {
  let algorithm;

  beforeEach(() => {
    algorithm = new SHA256Algorithm();
  });

  test('should create hash of string data', () => {
    const data = 'test data';
    const hash = algorithm.hash(data);
    expect(hash).toBeInstanceOf(Buffer);
    expect(hash.length).toBe(32);
  });

  test('should create consistent hashes', () => {
    const data = 'test data';
    const hash1 = algorithm.hash(data);
    const hash2 = algorithm.hash(data);
    expect(hash1).toEqual(hash2);
  });

  test('should double hash correctly', () => {
    const data = 'test data';
    const doubleHash = algorithm.doubleHash(data);
    expect(doubleHash).toBeInstanceOf(Buffer);
    expect(doubleHash.length).toBe(32);
  });
});

describe('CoinManager', () => {
  test('should get Bitcoin coin info', () => {
    const coin = CoinManager.getCoin('bitcoin');
    expect(coin.symbol).toBe('BTC');
    expect(coin.algorithm).toBe('sha256');
  });

  test('should get Litecoin coin info', () => {
    const coin = CoinManager.getCoin('litecoin');
    expect(coin.symbol).toBe('LTC');
    expect(coin.algorithm).toBe('scrypt');
  });

  test('should check if coin is supported', () => {
    expect(CoinManager.isSupportedCoin('bitcoin')).toBe(true);
    expect(CoinManager.isSupportedCoin('unknown')).toBe(false);
  });
});
