const express = require('express');
const Logger = require('../utils/logger');

const logger = Logger.getLogger('API');

class APIServer {
  constructor(apiConfig, miner) {
    this.config = apiConfig;
    this.miner = miner;
    this.app = express();
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(express.json());

    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    this.app.get('/stats', (req, res) => {
      const stats = this.miner.getStats();
      const uptime = Math.floor((Date.now() - stats.startTime) / 1000);
      const hashRate = stats.totalHashes / uptime;

      res.json({
        isRunning: this.miner.isRunning,
        uptime,
        hashRate: hashRate.toFixed(2),
        totalHashes: stats.totalHashes,
        blocksFound: stats.validBlocks
      });
    });

    this.app.get('/config', (req, res) => {
      res.json({
        coin: this.miner.config.coin,
        algorithm: this.miner.algorithm.name,
        difficulty: this.miner.config.difficulty,
        workers: this.miner.config.workers
      });
    });

    this.app.post('/start', async (req, res) => {
      if (this.miner.isRunning) {
        return res.status(400).json({ error: 'Miner is already running' });
      }
      await this.miner.start();
      res.json({ status: 'Miner started' });
    });

    this.app.post('/stop', async (req, res) => {
      if (!this.miner.isRunning) {
        return res.status(400).json({ error: 'Miner is not running' });
      }
      await this.miner.stop();
      res.json({ status: 'Miner stopped' });
    });

    this.app.use((err, req, res, next) => {
      logger.error('API error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.config.port, this.config.host, () => {
        logger.info(`API server listening on ${this.config.host}:${this.config.port}`);
        resolve();
      }).on('error', reject);
    });
  }

  async stop() {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = APIServer;
