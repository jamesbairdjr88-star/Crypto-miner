const Miner = require('./miner/miner');
const APIServer = require('./api/server');
const Logger = require('./utils/logger');
const fs = require('fs');
const path = require('path');

const logger = Logger.getLogger('Main');

async function main() {
  try {
    const configPath = process.env.CONFIG_PATH || path.join(__dirname, '../config.json');
    
    if (!fs.existsSync(configPath)) {
      logger.error(`Configuration file not found at ${configPath}`);
      logger.info('Please copy config.example.json to config.json and update it');
      process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    logger.info('Configuration loaded successfully');

    const miner = new Miner(config.miner, config.wallet, config.pool);
    logger.info(`Initializing miner for ${config.miner.coin}`);

    if (config.api.enabled) {
      const apiServer = new APIServer(config.api, miner);
      await apiServer.start();
      logger.info(`API server started on http://${config.api.host}:${config.api.port}`);
    }

    logger.info('Starting mining operations...');
    await miner.start();

    process.on('SIGINT', async () => {
      logger.info('Shutting down gracefully...');
      await miner.stop();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
