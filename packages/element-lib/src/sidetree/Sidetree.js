const registerServiceBusHandlers = require('./serviceBus');

class Sidetree {
  constructor({
    serviceBus, db, blockchain, storage, config,
  }) {
    this.blockchain = blockchain;
    this.storage = storage;
    this.serviceBus = serviceBus;
    this.db = db;
    this.config = config || {
      CACHE_EXPIRES_SECONDS: 2,
      BAD_STORAGE_HASH_DELAY_SECONDS: 10 * 60, // 10 minutes
      VERBOSITY: 0,
    };
    registerServiceBusHandlers(this);
    require('./getTransactions')(this);
    require('./getAnchorFile')(this);
    require('./getBatchFile')(this);
    require('./getOperations')(this);
    require('./createTransactionFromRequests')(this);
    require('./resolve')(this);
    require('./sync')(this);
    this.op = require('./op');
    this.sleep = seconds => new Promise(r => setTimeout(r, seconds * 1000));
  }

  async getPreviousOperationHash(didUniqueSuffix) {
    const cachedRecord = await this.db.read(`element:sidetree:did:elem:${didUniqueSuffix}`);
    if (cachedRecord) {
      return cachedRecord.record.previousOperationHash;
    }
    return null;
  }

  async close() {
    await this.sleep(1);
    await this.blockchain.close();
    await this.storage.close();
    await this.serviceBus.close();
    await this.db.close();
  }
}

module.exports = Sidetree;
