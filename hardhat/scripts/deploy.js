const { ethers } = require('hardhat');
const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL } = require('../constants');
require('dotenv').config({ path: '.env' });

async function main() {
  const whitelistContract = WHITELIST_CONTRACT_ADDRESS;

  const metadataURL = METADATA_URL;

  const cryptoDevsContract = await ethers.getContractFactory('CrptoDevs');

  const deployedCryptoDevsContract = await cryptoDevsContract.deploy(
    metadataURL,
    whitelistContract
  );

  await deployedCryptoDevsContract.deployed();

  console.log(
    'Crypto Devs Contract Address:',
    deployedCryptoDevsContract.address
  );
}

async function run() {
  try {
    await main();
    console.log('contract deployed');
  } catch (error) {
    console.log(error);
  }
}

run();
