export const coSignCeloAbi = [
  { type: "function", name: "totalHandshakes", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "getHandshake", stateMutability: "view", inputs: [{ name: "id", type: "uint256" }], outputs: [{ name: "", type: "tuple", components: [
    { name: "id", type: "uint256" }, { name: "creator", type: "address" }, { name: "signer", type: "address" },
    { name: "intendedSigner", type: "address" }, { name: "kind", type: "uint8" }, { name: "context", type: "string" },
    { name: "note", type: "string" }, { name: "createdAt", type: "uint64" }, { name: "expiresAt", type: "uint64" },
    { name: "completedAt", type: "uint64" }, { name: "cancelled", type: "bool" }
  ] }] },
  { type: "function", name: "getCreatedCount", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "getSignedCount", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "getCreatedId", stateMutability: "view", inputs: [{ name: "account", type: "address" }, { name: "index", type: "uint256" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "getSignedId", stateMutability: "view", inputs: [{ name: "account", type: "address" }, { name: "index", type: "uint256" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "createHandshake", stateMutability: "nonpayable", inputs: [
    { name: "kind", type: "uint8" }, { name: "context", type: "string" }, { name: "note", type: "string" },
    { name: "intendedSigner", type: "address" }, { name: "expiresAt", type: "uint64" }
  ], outputs: [{ name: "id", type: "uint256" }] },
  { type: "function", name: "cosign", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }], outputs: [{ name: "completedAt", type: "uint64" }] },
  { type: "function", name: "cancelHandshake", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }], outputs: [] }
] as const;
