const Logger = require('../utils/logger');
const SHA256Algorithm = require('../algorithms/sha256');
const ScryptAlgorithm = require('../algorithms/scrypt');
const CoinManager = require('../coins/coins');
const { Worker } = require('worker_threads');
const path = require('path');

const logger = Logger.getLogger('Miner');

class Miner {
  constructor(minerConfig, walletConfig, poolConfig) {
    this.config = minerConfig;
    this.walletConfig = walletConfig;
    this.poolConfig = poolConfig;
    this.isRunning = false;
    this.workers = [];
    this.stats = {
      totalHashes: 0,
      validBlocks: 0,
      blockTime: [],
      startTime: null,
      lastBlockTime: null
    };

    this.initializeAlgorithm();
  }

  initializeAlgorithm() {
    const coin = CoinManager.getCoin(this.config.coin);
    const algorithm = this.config.algorithm || coin.algorithm;

    if (algorithm === 'sha256') {
      this.algorithm = new SHA256Algorithm();
    } else if (algorithm === 'scrypt') {
      this.algorithm = new ScryptAlgorithm();
    } else {
      throw new Error(`Unsupported algorithm: ${algorithm}`);
    }

    logger.info(`Using ${this.algorithm.name} algorithm for ${coin.name}`);
  }

  async start() {
    if (this.isRunning) {
      logger.warn('Miner is already running');
      return;
    }

    this.isRunning = true;
    this.stats.startTime = Date.now();
    logger.info(`Starting miner with ${this.config.workers} workers`);

    for (let i = 0; i < this.config.workers; i++) {
      this.startWorker(i);
    }

    this.statsInterval = setInterval(() => {
      this.logStatistics();
    }, 10000);
  }

  startWorker(workerId) {
    const worker = new Worker(path.join(__dirname, 'worker.js'), {
      workerData: {
        algorithm: this.config.algorithm,
        coin: this.config.coin,
        difficulty: this.config.difficulty
      }
    });

    worker.on('message', (message) => {
      this.handleWorkerMessage(message, workerId);
    });

    worker.on('error', (error) => {
      logger.error(`Worker ${workerId} error:`, error);
      this.startWorker(workerId);
    });

    worker.on('exit', (code) => {
      if (this.isRunning) {
        logger.warn(`Worker ${workerId} exited with code ${code}, restarting...`);
        this.startWorker(workerId);
      }
    });

    this.workers[workerId] = worker;
    logger.info(`Worker ${workerId} started`);
  }

  handleWorkerMessage(message, workerId) {
    if (message.type === 'hash') {
      this.stats.totalHashes += message.count;
    } else if (message.type === 'block_found') {
      this.onBlockFound(message, workerId);
    }
  }

  onBlockFound(blockData, workerId) {
    const coin = CoinManager.getCoin(this.config.coin);
    const blockReward = coin.blockReward;

    this.stats.validBlocks++;
    const now = Date.now();
    if (this.stats.lastBlockTime) {
      const blockTime = (now - this.stats.lastBlockTime) / 1000;
      this.stats.blockTime.push(blockTime);
    }
    this.stats.lastBlockTime = now;

    logger.info(`🎉 Block found by worker ${workerId}!`);
    logger.info(`   Block Hash: ${blockData.hash.substring(0, 16)}...`);
    logger.info(`   Nonce: ${blockData.nonce}`);
    logger.info(`   Block Reward: ${blockReward} ${coin.symbol}`);
  }

  logStatistics() {
    const uptime = Math.floor((Date.now() - this.stats.startTime) / 1000);
    const hashRate = (this.stats.totalHashes / uptime).toFixed(2);
    const coin = CoinManager.getCoin(this.config.coin);
    const totalReward = (this.stats.validBlocks * coin.blockReward).toFixed(8);

    logger.info('📊 Mining Statistics:');
    logger.info(`   Uptime: ${uptime}s`);
    logger.info(`   Hash Rate: ${hashRate} H/s`);
    logger.info(`   Total Hashes: ${this.stats.totalHashes.toExponential(2)}`);
    logger.info(`   Blocks Found: ${this.stats.validBlocks}`);
    logger.info(`   Total Reward: ${totalReward} ${coin.symbol}`);
  }

  async stop() {
    if (!this.isRunning) {
      logger.warn('Miner is not running');
      return;
    }

    this.isRunning = false;
    clearInterval(this.statsInterval);

    logger.info('Stopping miner...');
    
    for (const worker of this.workers) {
      if (worker) {
        await worker.terminate();
      }
    }

    logger.info('Miner stopped');
    this.logStatistics();
  }

  getStats() {
    return this.stats;
  }
}

module.exports = Miner;
