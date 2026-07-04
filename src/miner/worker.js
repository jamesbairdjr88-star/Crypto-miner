const { workerData, parentPort } = require('worker_threads');
const SHA256Algorithm = require('../algorithms/sha256');
const ScryptAlgorithm = require('../algorithms/scrypt');

let algorithm;
let difficulty;
let hashCount = 0;

if (workerData.algorithm === 'sha256') {
  algorithm = new SHA256Algorithm();
} else if (workerData.algorithm === 'scrypt') {
  algorithm = new ScryptAlgorithm();
} else {
  algorithm = new SHA256Algorithm();
}

difficulty = workerData.difficulty;

setInterval(() => {
  parentPort.postMessage({
    type: 'stats',
    data: {
      hashesPerInterval: hashCount,
      timestamp: Date.now()
    }
  });
  hashCount = 0;
}, 5000);

function generateBlock() {
  const timestamp = Date.now();
  const transactions = Math.floor(Math.random() * 2000);
  const blockHeader = JSON.stringify({
    version: 1,
    previousHash: Math.random().toString(36),
    merkleRoot: Math.random().toString(36),
    timestamp,
    difficulty,
    transactions
  });
  return blockHeader;
}

async function mine() {
  while (true) {
    try {
      const blockData = generateBlock();
      const result = algorithm.mine(blockData, difficulty);
      
      hashCount += result.attempts;

      parentPort.postMessage({
        type: 'block_found',
        hash: result.hash,
        nonce: result.nonce,
        attempts: result.attempts,
        timestamp: Date.now()
      });

      parentPort.postMessage({
        type: 'hash',
        count: result.attempts
      });

    } catch (error) {
      parentPort.postMessage({
        type: 'error',
        message: error.message
      });
    }
  }
}

mine().catch(error => {
  parentPort.postMessage({
    type: 'error',
    message: `Fatal error: ${error.message}`
  });
});
