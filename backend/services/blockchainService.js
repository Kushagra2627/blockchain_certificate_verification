const { getContract, getWallet } = require("../config/ethereum");

/**
 * Service wrapper for interacting with the Ethereum Smart Contract
 * using SHA-256 PDF document hash (bytes32) as the primary key.
 */
class BlockchainService {
  /**
   * Helper to format a 64-character SHA-256 hex string into a 0x-prefixed bytes32 hex string.
   */
  static toBytes32(hashHex) {
    if (!hashHex || typeof hashHex !== "string") {
      throw new Error("Invalid document hash: Hash must be a string");
    }
    const cleanHex = hashHex.startsWith("0x") ? hashHex.slice(2) : hashHex;
    if (cleanHex.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(cleanHex)) {
      throw new Error("Invalid SHA-256 document hash format: Must be exactly 64 hexadecimal characters");
    }
    return "0x" + cleanHex.toLowerCase();
  }

  /**
   * Write certificate metadata directly onto the blockchain smart contract
   * indexed by bytes32 documentHash.
   */
  static async issueCertificateOnChain(certificateId, studentName, course, institution, issueDate, documentHashHex) {
    try {
      const contract = getContract();
      if (!contract) {
        throw new Error("Smart contract connection not initialized. Deploy contract or check config.");
      }

      const bytes32Hash = this.toBytes32(documentHashHex);

      // Check if document hash already exists on chain
      const exists = await contract.existsByHash(bytes32Hash);
      if (exists) {
        throw new Error(`Document hash '${documentHashHex}' already anchored on the blockchain.`);
      }

      console.log(`[Blockchain]: Issuing cert with hash '${documentHashHex}' on smart contract...`);
      const tx = await contract.issueCertificate(
        certificateId || "",
        studentName,
        course,
        institution,
        issueDate,
        bytes32Hash
      );

      console.log(`[Blockchain]: Sent Tx Hash ${tx.hash}. Waiting for 1 block confirmation...`);
      const receipt = await tx.wait(1);

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        contractAddress: await contract.getAddress(),
        issuerWallet: getWallet().address,
      };
    } catch (error) {
      console.error("[BlockchainService.issueCertificateOnChain Error]:", error.message);
      throw error;
    }
  }

  /**
   * PRIMARY VERIFICATION METHOD: Fetch certificate details directly from the blockchain by documentHash
   */
  static async getCertificateByDocHash(documentHashHex) {
    try {
      const contract = getContract();
      if (!contract) {
        return {
          existsOnChain: false,
          error: "Smart contract not initialized. Connect to Ethereum node.",
        };
      }

      const bytes32Hash = this.toBytes32(documentHashHex);

      const exists = await contract.existsByHash(bytes32Hash);
      if (!exists) {
        return {
          existsOnChain: false,
          isValid: false,
          message: "Document hash does not exist on Ethereum blockchain.",
        };
      }

      const result = await contract.getCertificateByHash(bytes32Hash);

      return {
        existsOnChain: true,
        isValid: !result.isRevoked,
        certificateId: result.certificateId,
        studentName: result.studentName,
        course: result.course,
        institution: result.institution,
        issueDate: result.issueDate,
        documentHash: documentHashHex.toLowerCase(),
        timestamp: Number(result.timestamp),
        issuerWallet: result.issuerWallet,
        isRevoked: result.isRevoked,
      };
    } catch (error) {
      console.error("[BlockchainService.getCertificateByDocHash Error]:", error.message);
      return {
        existsOnChain: false,
        isValid: false,
        error: error.message,
      };
    }
  }

  /**
   * Check if a document hash exists on chain
   */
  static async existsByHash(documentHashHex) {
    try {
      const contract = getContract();
      if (!contract) return false;
      const bytes32Hash = this.toBytes32(documentHashHex);
      return await contract.existsByHash(bytes32Hash);
    } catch (error) {
      console.error("[BlockchainService.existsByHash Error]:", error.message);
      return false;
    }
  }

  /**
   * Revoke a certificate by document hash on chain
   */
  static async revokeCertificateByHash(documentHashHex) {
    try {
      const contract = getContract();
      if (!contract) {
        throw new Error("Smart contract connection not initialized.");
      }

      const bytes32Hash = this.toBytes32(documentHashHex);
      const tx = await contract.revokeCertificateByHash(bytes32Hash);
      const receipt = await tx.wait(1);

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error("[BlockchainService.revokeCertificateByHash Error]:", error.message);
      throw error;
    }
  }
}

module.exports = BlockchainService;
