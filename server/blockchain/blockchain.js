const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const fs = require('fs');

class Transaction {
  /**
   * @param {string} Usuario
   * @param {string} Contraseña
   * @param {string} keyPublic
   */
  constructor(Usuario, Contraseña, keyPublic) {
    this.Usuario = Usuario;
    this.Contraseña = Contraseña;
    this.keyPublic = keyPublic;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Creates a SHA256 hash of the transaction
   *
   * @returns {string}
   */
  calculateHash() {
    return SHA256(this.Usuario + this.Contraseña + this.timestamp)
      .toString();
  }

  /**
   * Signs a transaction with the given signingKey (which is an Elliptic keypair
   * object that contains a private key). The signature is then stored inside the
   * transaction object and later stored on the blockchain.
   *
   * @param {string} signingKey
   */
  signTransaction(signingKey) {
    // You can only send a transaction from the wallet that is linked to your
    // key. So here we check if the Usuario matches your publicKey
    if (signingKey.getPublic('hex') !== this.keyPublic) {
      throw new Error('You cannot sign transactions for other wallets!');
    }
    

    // Calculate the hash of this transaction, sign it with the key
    // and store it inside the transaction obect
    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, 'base64');

    this.signature = sig.toDER('hex');
  }

  /**
   * Checks if the signature is valid (transaction has not been tampered with).
   * It uses the Contraseña as the public key.
   *
   * @returns {boolean}
   */
  isValid() {
    // If the transaction doesn't have a from address we assume it's a
    // mining reward and that it's valid. You could verify this in a
    // different way (special field for instance)
    if (this.keyPublic === null) return true;

    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this transaction');
    }

    const publicKey = ec.keyFromPublic(this.keyPublic, 'hex');
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

class Block {
  /**
   * @param {number} timestamp
   * @param {Transaction} transactions
   * @param {string} previousHash
   */
  constructor(timestamp, transactions, previousHash = '') {
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  /**
   * Returns the SHA256 of this block (by processing all the data stored
   * inside this block)
   *
   * @returns {string}
   */
  calculateHash() {
    return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
  }

  /**
   * Starts the mining process on the block. It changes the 'nonce' until the hash
   * of the block starts with enough zeros (= difficulty)
   *
   * @param {number} difficulty
   */
  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log(`Block mined: ${this.hash}`);
  }

  /**
   * Validates all the transactions inside this block (signature + hash) and
   * returns true if everything checks out. False if the block is invalid.
   *
   * @returns {boolean}
   */
  hasValidTransactions() {
    if (!this.transactions.isValid()) {
        return false;
    }

    return true;
  }

  getBlock() {
    return this;
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions;
  }

  /**
   * @returns {Block}
   */
  createGenesisBlock() {
    return new Block(new Date().toISOString(), null, '0');
  }

  /**
   * Returns the latest block on our chain. Useful when you want to create a
   * new Block and you need the hash of the previous Block.
   *
   * @returns {Block[]}
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Takes all the pending transactions, puts them in a Block and starts the
   * mining process. It also adds a transaction to send the mining reward to
   * the given address.
   *
   * @param {string} miningRewardAddress
   */
  minePendingTransactions() {
    let block = new Block(new Date().toISOString(), this.pendingTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);

    console.log('Block successfully mined!');
    this.chain.push(block);

    this.pendingTransactions = null;
  }

  /**
   * Add a new transaction to the list of pending transactions (to be added
   * next time the mining process starts). This verifies that the given
   * transaction is properly signed.
   *
   * @param {Transaction} transaction
   */
  addTransaction(transaction) {
    if (!transaction.Usuario || !transaction.Contraseña) {
      throw new Error('Transaction must include from and to address');
    }

    // Verify the transactiion
    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transaction to chain');
    }

    this.pendingTransactions = transaction;
  }

  /**
   * Returns a list of all transactions that happened
   * to and from the given wallet address.
   *
   * @param  {string} address
   * @return {Transaction[]}
   */
  getAllTransactionsForWallet(address) {
    const txs = [];

    for (const block of this.chain) {
      if (block.transactions.Usuario === address || block.transactions.Contraseña === address) {
          txs.push(tx);
      }
    }

    return txs;
  }

  /**
   * Loops over all the blocks in the chain and verify if they are properly
   * linked together and nobody has tampered with the hashes. By checking
   * the blocks it also verifies the (signed) transactions inside of them.
   *
   * @returns {boolean}
   */
  isChainValid() {
    // Check if the Genesis block hasn't been tampered with by comparing
    // the output of createGenesisBlock with the first block on our chain
    const realGenesis = JSON.stringify(this.createGenesisBlock());

    if (realGenesis !== JSON.stringify(this.chain[0])) {
      return false;
    }

    // Check the remaining blocks on the chain to see if there hashes and
    // signatures are correct
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];

      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
    }

    return true;
  }

  leerArchivo() {
    let obj = fs.readFileSync('blockchain.json', 'utf-8');
    this.chain = JSON.parse(obj);
  }

  escribirArchivo() {
    fs.writeFile('blockchain.json', JSON.stringify(this.chain,null,' '), function (err) {
      if (err) throw err;
    });
  }

  compararUsuario(user) {
    this.leerArchivo();
    console.log(user);
    console.log(this.chain[1].transactions);

    for (let i = 1; i < this.chain.length-1; i++) {
      var currentBlock = this.chain[i];
      
      if (currentBlock.transactions.Usuario.localeCompare(user)) {
        return true;
      }

    }

    return false;

  }

  compararContrase(pass) {
    this.leerArchivo();

    for (let i = 1; i < this.chain.length-1; i++) {
      var currentBlock = this.chain[i];

      if (!currentBlock.transactions.Contraseña.localeCompare(pass)) {
        return true;
      }

    }

    return false;

  }
}

module.exports.Blockchain = Blockchain;
module.exports.Block = Block;
module.exports.Transaction = Transaction;
