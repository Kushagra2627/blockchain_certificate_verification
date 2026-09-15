// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CertificateVerification
 * @dev Smart Contract for issuing, storing, and verifying academic certificates on Ethereum
 * using PDF document SHA-256 hash (bytes32) as the primary and authoritative verification mechanism.
 */
contract CertificateVerification {
    address public owner;

    struct Certificate {
        string certificateId;    // Optional human-readable ID metadata
        string studentName;
        string course;
        string institution;
        string issueDate;
        bytes32 documentHash;   // Authoritative SHA-256 PDF hash
        uint256 timestamp;
        address issuerWallet;
        bool exists;
        bool isRevoked;
    }

    // Primary Mapping: Keyed directly by SHA-256 PDF document hash (bytes32)
    mapping(bytes32 => Certificate) private certificatesByHash;
    
    // Secondary Mapping: Optional lookup by Certificate ID for administrative reference
    mapping(string => bytes32) private hashByCertId;

    // Array of all document hashes
    bytes32[] private allDocumentHashes;

    // Events
    event CertificateIssued(
        bytes32 indexed documentHash,
        string certificateId,
        string studentName,
        string course,
        string institution,
        string issueDate,
        uint256 timestamp,
        address indexed issuerWallet
    );

    event CertificateUpdated(
        bytes32 indexed documentHash,
        string studentName,
        string course,
        string institution,
        uint256 timestamp
    );

    event CertificateRevoked(
        bytes32 indexed documentHash,
        uint256 timestamp,
        address indexed revokedBy
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Error: Caller is not the owner/issuer authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Issue a new certificate on the blockchain using PDF documentHash as the primary key
     */
    function issueCertificate(
        string memory _certificateId,
        string memory _studentName,
        string memory _course,
        string memory _institution,
        string memory _issueDate,
        bytes32 _documentHash
    ) public onlyOwner returns (bool) {
        require(_documentHash != bytes32(0), "Error: Document hash required");
        require(bytes(_studentName).length > 0, "Error: Student name cannot be empty");
        require(bytes(_course).length > 0, "Error: Course cannot be empty");
        require(bytes(_institution).length > 0, "Error: Institution cannot be empty");
        require(!certificatesByHash[_documentHash].exists, "Error: Certificate with this document hash already issued on blockchain");

        Certificate memory newCert = Certificate({
            certificateId: _certificateId,
            studentName: _studentName,
            course: _course,
            institution: _institution,
            issueDate: _issueDate,
            documentHash: _documentHash,
            timestamp: block.timestamp,
            issuerWallet: msg.sender,
            exists: true,
            isRevoked: false
        });

        certificatesByHash[_documentHash] = newCert;
        allDocumentHashes.push(_documentHash);

        if (bytes(_certificateId).length > 0) {
            hashByCertId[_certificateId] = _documentHash;
        }

        emit CertificateIssued(
            _documentHash,
            _certificateId,
            _studentName,
            _course,
            _institution,
            _issueDate,
            block.timestamp,
            msg.sender
        );

        return true;
    }

    /**
     * @dev PRIMARY VERIFICATION METHOD: Retrieve certificate details directly by documentHash
     */
    function getCertificateByHash(bytes32 _documentHash)
        public
        view
        returns (
            string memory certificateId,
            string memory studentName,
            string memory course,
            string memory institution,
            string memory issueDate,
            bytes32 documentHash,
            uint256 timestamp,
            address issuerWallet,
            bool exists,
            bool isRevoked
        )
    {
        require(certificatesByHash[_documentHash].exists, "Error: Certificate not found on blockchain");

        Certificate memory cert = certificatesByHash[_documentHash];
        return (
            cert.certificateId,
            cert.studentName,
            cert.course,
            cert.institution,
            cert.issueDate,
            cert.documentHash,
            cert.timestamp,
            cert.issuerWallet,
            cert.exists,
            cert.isRevoked
        );
    }

    /**
     * @dev Check if a certificate exists on blockchain by documentHash
     */
    function existsByHash(bytes32 _documentHash) public view returns (bool) {
        return certificatesByHash[_documentHash].exists;
    }

    /**
     * @dev Revoke a certificate by its documentHash
     */
    function revokeCertificateByHash(bytes32 _documentHash) public onlyOwner returns (bool) {
        require(certificatesByHash[_documentHash].exists, "Error: Certificate does not exist");
        require(!certificatesByHash[_documentHash].isRevoked, "Error: Certificate is already revoked");

        certificatesByHash[_documentHash].isRevoked = true;

        emit CertificateRevoked(_documentHash, block.timestamp, msg.sender);
        return true;
    }

    /**
     * @dev Legacy / Admin Helper: Revoke a certificate by Certificate ID
     */
    function revokeCertificate(string memory _certificateId) public onlyOwner returns (bool) {
        bytes32 docHash = hashByCertId[_certificateId];
        require(docHash != bytes32(0), "Error: Certificate ID not found");
        return revokeCertificateByHash(docHash);
    }

    /**
     * @dev Admin Helper: Update display metadata without modifying immutable documentHash
     */
    function updateCertificate(
        bytes32 _documentHash,
        string memory _studentName,
        string memory _course,
        string memory _institution
    ) public onlyOwner returns (bool) {
        require(certificatesByHash[_documentHash].exists, "Error: Certificate does not exist");
        require(!certificatesByHash[_documentHash].isRevoked, "Error: Cannot update revoked certificate");

        certificatesByHash[_documentHash].studentName = _studentName;
        certificatesByHash[_documentHash].course = _course;
        certificatesByHash[_documentHash].institution = _institution;

        emit CertificateUpdated(
            _documentHash,
            _studentName,
            _course,
            _institution,
            block.timestamp
        );

        return true;
    }

    /**
     * @dev Admin Helper: Look up document hash by Certificate ID
     */
    function getHashByCertId(string memory _certificateId) public view returns (bytes32) {
        return hashByCertId[_certificateId];
    }

    /**
     * @dev Total count of certificates issued
     */
    function getTotalCertificatesCount() public view returns (uint256) {
        return allDocumentHashes.length;
    }
}
