const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

let provider;
let wallet;
let contract;

const initEthereum = () => {
  try {
    const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
    provider = new ethers.JsonRpcProvider(rpcUrl);

    const privateKey = process.env.ISSUER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    wallet = new ethers.Wallet(privateKey, provider);

    // Try reading deployed contract info
    const contractDetailsPath = path.join(__dirname, "contractDetails.json");
    let contractAddress = process.env.CONTRACT_ADDRESS;
    let abi = [];

    if (fs.existsSync(contractDetailsPath)) {
      const contractDetails = JSON.parse(fs.readFileSync(contractDetailsPath, "utf8"));
      contractAddress = contractAddress || contractDetails.address;
      abi = contractDetails.abi;
    }

    if (!contractAddress) {
      console.warn("[Ethereum Config Warning]: Contract address not set in environment or contractDetails.json");
      return null;
    }

    // Default minimal ABI fallback if contractDetails ABI is empty
    if (!abi || abi.length === 0) {
      abi = [
        "function issueCertificate(string _certificateId, string _studentName, string _course, string _institution, string _issueDate) public returns (bool)",
        "function verifyCertificate(string _certificateId) public view returns (bool isValid, string studentName, string course, string institution, string issueDate, uint256 timestamp, address issuerWallet, bool isRevoked)",
        "function getCertificate(string _certificateId) public view returns (string certificateId, string studentName, string course, string institution, string issueDate, uint256 timestamp, address issuerWallet, bool isRevoked)",
        "function updateCertificate(string _certificateId, string _studentName, string _course, string _institution) public returns (bool)",
        "function certificateExists(string _certificateId) public view returns (bool)"
      ];
    }

    contract = new ethers.Contract(contractAddress, abi, wallet);
    console.log(`[Ethereum Connected]: Provider ${rpcUrl} | Contract ${contractAddress}`);
    return contract;
  } catch (error) {
    console.error(`[Ethereum Config Error]: ${error.message}`);
    return null;
  }
};

const getContract = () => {
  if (!contract) {
    contract = initEthereum();
  }
  return contract;
};

const getProvider = () => provider;
const getWallet = () => wallet;

module.exports = {
  initEthereum,
  getContract,
  getProvider,
  getWallet,
};
