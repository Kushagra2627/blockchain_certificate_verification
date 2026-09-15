const { expect } = require("chai");
const { ethers } = require("hardhat");
const crypto = require("crypto");

describe("CertificateVerification Smart Contract", function () {
  let CertificateVerification;
  let contract;
  let owner;
  let addr1;

  // Generate a valid 64-character SHA-256 hex hash and convert to bytes32 via '0x' + hashHex
  const samplePdfBuffer = Buffer.from("%PDF-1.4 sample certificate pdf content for testing");
  const sampleHashHex = crypto.createHash('sha256').update(samplePdfBuffer).digest('hex');
  const sampleHashBytes32 = "0x" + sampleHashHex;

  const sampleCert = {
    id: "CERT-2026-889900",
    name: "John Doe",
    course: "Blockchain & Smart Contracts Engineering",
    institution: "Stanford University",
    issueDate: "2026-08-01",
    documentHash: sampleHashBytes32
  };

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    CertificateVerification = await ethers.getContractFactory("CertificateVerification");
    contract = await CertificateVerification.deploy();
    await contract.waitForDeployment();
  });

  it("Should set the correct owner upon deployment", async function () {
    expect(await contract.owner()).to.equal(owner.address);
  });

  it("Should allow owner to issue a new certificate with documentHash", async function () {
    const tx = await contract.issueCertificate(
      sampleCert.id,
      sampleCert.name,
      sampleCert.course,
      sampleCert.institution,
      sampleCert.issueDate,
      sampleCert.documentHash
    );
    await tx.wait();

    const exists = await contract.existsByHash(sampleCert.documentHash);
    expect(exists).to.be.true;

    const cert = await contract.getCertificateByHash(sampleCert.documentHash);
    expect(cert.certificateId).to.equal(sampleCert.id);
    expect(cert.studentName).to.equal(sampleCert.name);
    expect(cert.course).to.equal(sampleCert.course);
    expect(cert.institution).to.equal(sampleCert.institution);
    expect(cert.documentHash).to.equal(sampleCert.documentHash);
    expect(cert.issuerWallet).to.equal(owner.address);
    expect(cert.isRevoked).to.be.false;
  });

  it("Should prevent non-owner from issuing a certificate", async function () {
    await expect(
      contract.connect(addr1).issueCertificate(
        sampleCert.id,
        sampleCert.name,
        sampleCert.course,
        sampleCert.institution,
        sampleCert.issueDate,
        sampleCert.documentHash
      )
    ).to.be.revertedWith("Error: Caller is not the owner/issuer authorized");
  });

  it("Should prevent duplicate documentHash issuance", async function () {
    await contract.issueCertificate(
      sampleCert.id,
      sampleCert.name,
      sampleCert.course,
      sampleCert.institution,
      sampleCert.issueDate,
      sampleCert.documentHash
    );

    await expect(
      contract.issueCertificate(
        "CERT-DIFFERENT-ID",
        sampleCert.name,
        sampleCert.course,
        sampleCert.institution,
        sampleCert.issueDate,
        sampleCert.documentHash
      )
    ).to.be.revertedWith("Error: Certificate with this document hash already issued on blockchain");
  });

  it("Should update certificate metadata by documentHash", async function () {
    await contract.issueCertificate(
      sampleCert.id,
      sampleCert.name,
      sampleCert.course,
      sampleCert.institution,
      sampleCert.issueDate,
      sampleCert.documentHash
    );

    await contract.updateCertificate(
      sampleCert.documentHash,
      "Jane Doe Updated",
      "Advanced Web3 Systems",
      "MIT University"
    );

    const cert = await contract.getCertificateByHash(sampleCert.documentHash);
    expect(cert.studentName).to.equal("Jane Doe Updated");
    expect(cert.course).to.equal("Advanced Web3 Systems");
    expect(cert.institution).to.equal("MIT University");
  });

  it("Should revoke a certificate by documentHash", async function () {
    await contract.issueCertificate(
      sampleCert.id,
      sampleCert.name,
      sampleCert.course,
      sampleCert.institution,
      sampleCert.issueDate,
      sampleCert.documentHash
    );

    await contract.revokeCertificateByHash(sampleCert.documentHash);

    const cert = await contract.getCertificateByHash(sampleCert.documentHash);
    expect(cert.isRevoked).to.be.true;
  });
});
