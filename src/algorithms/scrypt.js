const crypto = require('crypto');

class ScryptAlgorithm {
  constructor() {
    this.name = 'Scrypt';
  }

  hash(data) {
    if (typeof data === 'string') {
      data = Buffer.from(data, 'utf8');
    }
    
    const salt = Buffer.alloc(16, 0);
    return crypto.pbkdf2Sync(data, salt, 1024, 32, 'sha256');
  }

  mine(blockData, difficulty) {
    let nonce = 0;
    const target = Math.pow(2, 256 - difficulty);
    let hash;
    let hashValue;

    const startTime = Date.now();

    while (nonce < Number.MAX_SAFE_INTEGER) {
      const dataWithNonce = blockData + nonce;
      hash = this.hash(dataWithNonce);
      hashValue = parseInt(hash.toString('hex').substring(0, 8), 16);

      if (hashValue < target) {
        return {
          nonce,
          hash: hash.toString('hex'),
          timestamp: Date.now() - startTime,
          attempts: nonce + 1
        };
      }

      nonce++;
    }

    throw new Error('Mining failed: maximum nonce reached');
  }

  verifyDifficulty(hash, difficulty) {
    const target = Math.pow(2, 256 - difficulty);
    const hashValue = parseInt(hash.substring(0, 8), 16);
    return hashValue < target;
  }
}

module.exports = ScryptAlgorithm;
