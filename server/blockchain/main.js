const { Blockchain, Transaction } = require('./blockchain');
const fs = require('fs');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
// Your private key goes here
const myKey = ec.keyFromPrivate('7c4c45907dec40c91bab3480c39032e90049f1a44f3e18c3e07c23e3273995cf');
// From that we can calculate your public key (which doubles as your wallet address)
const myWalletAddress = myKey.getPublic('hex');
// Create new instance of Blockchain class
const savjeeCoin = new Blockchain();

//savjeeCoin.leerArchivo();
//savjeeCoin.escribirArchivo();

if(savjeeCoin.compararUsuario("address3")) {
    console.log("Existe");
}else{
    console.log("No existe");
}
console.log("Funciona");

//Create a transaction & sign it with your key
//const tx1 = new Transaction('address3', 'address2', myWalletAddress);
//tx1.signTransaction(myKey);
//savjeeCoin.addTransaction(tx1);

 //Mine block
//savjeeCoin.minePendingTransactions('address3');

// Create second transaction
//const tx2 = new Transaction('address1', 'address2', myWalletAddress);
//tx2.signTransaction(myKey);
//avjeeCoin.addTransaction(tx2);

// Mine block
//savjeeCoin.minePendingTransactions('address1');
