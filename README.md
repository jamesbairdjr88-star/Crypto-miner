# Crypto Miner

A high-performance cryptocurrency mining application that supports multiple mining algorithms and coin types.

## Features

- **Multiple Mining Algorithms**: SHA-256 (Bitcoin) and Scrypt (Litecoin, Dogecoin)
- **Coin Support**: Bitcoin, Litecoin, Dogecoin, and Ethereum
- **Multi-threaded Mining**: Configurable worker threads for parallel mining
- **Real-time Statistics**: Mining speed, difficulty, rewards, and block tracking
- **REST API**: Monitor and control mining operations via HTTP endpoints
- **JSON Configuration**: Easy setup with JSON config files
- **Detailed Logging**: Winston-based logging to console and files

## Quick Start

### Prerequisites
- Node.js 14+ 
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jamesbairdjr88-star/crypto-miner.git
cd crypto-miner
```

2. Install dependencies:
```bash
npm install
```

3. Create configuration file:
```bash
cp config.example.json config.json
```

4. Edit `config.json` with your settings

### Running the Miner

```bash
npm start
```

## Configuration

Edit `config.json`:

```json
{
  "miner": {
    "coin": "bitcoin",
    "algorithm": "sha256",
    "difficulty": 2,
    "workers": 4
  },
  "wallet": {
    "address": "YOUR_WALLET_ADDRESS",
    "poolUser": "username",
    "poolPassword": "password"
  },
  "api": {
    "enabled": true,
    "port": 3000,
    "host": "localhost"
  }
}
```

## REST API Endpoints

- `GET /health` - Health check
- `GET /stats` - Mining statistics
- `GET /config` - Current configuration
- `POST /start` - Start mining
- `POST /stop` - Stop mining

## Example Usage

```bash
# Check health
curl http://localhost:3000/health

# Get statistics
curl http://localhost:3000/stats

# Start mining
curl -X POST http://localhost:3000/start

# Stop mining
curl -X POST http://localhost:3000/stop
```

## Directory Structure

```
src/
  index.js              Main entry point
  miner/
    miner.js            Core mining engine
    worker.js           Worker thread
  algorithms/
    sha256.js           SHA-256 algorithm
    scrypt.js           Scrypt algorithm
  coins/
    coins.js            Coin definitions
  api/
    server.js           REST API
  utils/
    logger.js           Logging utility
```

## Supported Coins

| Coin | Symbol | Algorithm | Block Reward |
|------|--------|-----------|-------------|
| Bitcoin | BTC | SHA-256 | 6.25 |
| Litecoin | LTC | Scrypt | 12.5 |
| Dogecoin | DOGE | Scrypt | 10000 |
| Ethereum | ETH | Ethash | 2 |

## License

MIT
