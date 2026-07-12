import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.create();
  const network = await ethers.provider.getNetwork();
  const contract = await ethers.deployContract("CoSignRegistry");
  const transaction = contract.deploymentTransaction();
  await contract.waitForDeployment();
  const receipt = transaction ? await transaction.wait() : null;
  console.log("CoSignRegistry deployed");
  console.log("network:", hre.globalOptions.network);
  console.log("chainId:", Number(network.chainId));
  console.log("address:", await contract.getAddress());
  console.log("deploymentTx:", transaction?.hash ?? "");
  console.log("deploymentBlock:", receipt?.blockNumber ?? "");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
