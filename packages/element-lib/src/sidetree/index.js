const winston = require('winston');
const resolve = require('./resolve');
const { sync, syncTransaction } = require('./sync');
const {
  getTransactions,
  getTransactionSummary,
} = require('./utils/transactions');
const getNodeInfo = require('./utils/getNodeInfo');
const OperationQueue = require('./batch/operationQueue');
const BatchScheduler = require('./batch/BatchScheduler');
const batchWrite = require('./batch/batchWrite');
const op = require('./op');
const func = require('../func');

class Sidetree {
  constructor({ db, blockchain, storage, parameters } = {}) {
    if (!parameters) {
      throw new Error('parameters is missing');
    }
    if (!parameters.didMethodName) {
      throw new Error('didMethodName parameter is missing');
    }
    const operationQueue = new OperationQueue(db);
    // Parameters
    this.parameters = parameters;
    // Utils for sidetree
    this.blockchain = blockchain;
    this.storage = storage;
    this.db = db;
    this.op = op(this);
    this.func = func;
    // Observer
    this.sync = sync(this);
    this.syncTransaction = syncTransaction(this);
    // Resolver
    this.resolve = resolve(this);
    // Batching
    this.operationQueue = operationQueue;
    this.batchWrite = batchWrite(this);
    this.batchScheduler = new BatchScheduler(this);

    this.getTransactions = getTransactions(this);
    this.getTransactionSummary = getTransactionSummary(this);
    this.getNodeInfo = getNodeInfo(this);

    // let transports;
    // let level;

    // if (process.env.NODE_ENV === 'test') {
    //   // Disable logs in tests
    //   level = 'error';
    //   transports = ;
    // } else {
    //   level = 'info';
    //   transports = [new winston.transports.Console()];
    // }

    const { logLevel } = parameters;
    console.log({ logLevel });
    const logger = winston.createLogger({
      level: logLevel || 'info',
      transports: [new winston.transports.Console()],
    });
    this.logger = logger;
    this.blockchain.logger = logger;
  }

  async close() {
    await this.batchScheduler.stopPeriodicBatchWriting();
    await this.blockchain.close();
    await this.storage.close();
    await this.db.close();
  }
}

module.exports = Sidetree;
