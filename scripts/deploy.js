const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment of CertificateVerification contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  const CertificateVerification = await hre.ethers.getContractFactory("CertificateVerification");
  const contract = await CertificateVerification.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("CertificateVerification deployed to address:", contractAddress);

  // Save Contract Address & Artifact to backend config
  const backendConfigDir = path.join(__dirname, "../backend/config");
  if (!fs.existsSync(backendConfigDir)) {
    fs.mkdirSync(backendConfigDir, { recursive: true });
  }

  const artifactPath = path.join(__dirname, "../artifacts/contracts/CertificateVerification.sol/CertificateVerification.json");
  let artifactData = {};
  if (fs.existsSync(artifactPath)) {
    artifactData = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  }

  const contractInfo = {
    address: contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 1337,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    abi: artifactData.abi || []
  };

  const outputPath = path.join(backendConfigDir, "contractDetails.json");
  fs.writeFileSync(outputPath, JSON.stringify(contractInfo, null, 2));

  console.log(`Saved contract details and ABI to: ${outputPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error during deployment:", error);
    process.exit(1);
  });
