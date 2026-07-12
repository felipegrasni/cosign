const read = (name: string, fallback = "") => process.env[name]?.trim() || fallback;

export const serverEnv = {
  privateKey: read("PRIVATE_KEY"),
  etherscanApiKey: read("ETHERSCAN_API_KEY"),
  celoscanApiKey: read("CELOSCAN_API_KEY"),
  celoMainnetRpc: read("CELO_MAINNET_RPC_URL", "https://forno.celo.org"),
  celoSepoliaRpc: read("CELO_SEPOLIA_RPC_URL", "https://forno.celo-sepolia.celo-testnet.org"),
  celoMainnetAddress: read("COSIGN_CELO_CONTRACT_ADDRESS_MAINNET"),
  celoSepoliaAddress: read("COSIGN_CELO_CONTRACT_ADDRESS_SEPOLIA")
};
