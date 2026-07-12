import { expect } from "chai";
import { network } from "hardhat";
import type { BaseContract, ContractRunner, ContractTransactionResponse } from "ethers";

type Connection = Awaited<ReturnType<typeof network.create>>;
const DAY = 86_400;

type TestContract = BaseContract & {
  createHandshake(kind: number, context: string, note: string, intendedSigner: string, expiresAt: number): Promise<ContractTransactionResponse>;
  cosign(id: number): Promise<ContractTransactionResponse>;
  cancelHandshake(id: number): Promise<ContractTransactionResponse>;
  getHandshake(id: number): Promise<{ creator: string; signer: string; context: string; completedAt: bigint; cancelled: boolean }>;
  getCreatedCount(address: string): Promise<bigint>;
  getCreatedId(address: string, index: number): Promise<bigint>;
  getSignedCount(address: string): Promise<bigint>;
  getSignedId(address: string, index: number): Promise<bigint>;
};

const connected = (contract: BaseContract, runner: ContractRunner) => contract.connect(runner) as unknown as TestContract;

describe("CoSignRegistry", function () {
  let ethers: Connection["ethers"];

  before(async () => { ({ ethers } = await network.create()); });

  async function fixture() {
    const [creator, signer, other] = await ethers.getSigners();
    const contract = (await (await ethers.getContractFactory("CoSignRegistry")).deploy()) as unknown as TestContract;
    await contract.waitForDeployment();
    const block = await ethers.provider.getBlock("latest");
    return { contract, creator, signer, other, now: Number(block!.timestamp) };
  }

  it("creates an open card and indexes it", async () => {
    const { contract, creator, now } = await fixture();
    await expect(connected(contract, creator).createHandshake(1, "Open source lounge", "We shipped together.", ethers.ZeroAddress, now + DAY))
      .to.emit(contract, "HandshakeCreated").withArgs(1, creator.address, ethers.ZeroAddress, 1, now + DAY);
    const item = await contract.getHandshake(1);
    expect(item.creator).to.equal(creator.address);
    expect(item.context).to.equal("Open source lounge");
    expect(await contract.getCreatedCount(creator.address)).to.equal(1);
    expect(await contract.getCreatedId(creator.address, 0)).to.equal(1);
  });

  it("creates and completes an addressed card", async () => {
    const { contract, creator, signer, now } = await fixture();
    await connected(contract, creator).createHandshake(0, "Builder meetup", "We met and compared notes.", signer.address, now + DAY);
    await expect(connected(contract, signer).cosign(1)).to.emit(contract, "HandshakeCosigned");
    const item = await contract.getHandshake(1);
    expect(item.signer).to.equal(signer.address);
    expect(item.completedAt).to.be.greaterThan(0);
    expect(await contract.getSignedCount(signer.address)).to.equal(1);
    expect(await contract.getSignedId(signer.address, 0)).to.equal(1);
  });

  it("rejects invalid inputs and self targeting", async () => {
    const { contract, creator, now } = await fixture();
    await expect(connected(contract, creator).createHandshake(5, "x", "y", ethers.ZeroAddress, now + DAY)).to.be.revertedWithCustomError(contract, "InvalidKind");
    await expect(connected(contract, creator).createHandshake(0, "", "y", ethers.ZeroAddress, now + DAY)).to.be.revertedWithCustomError(contract, "InvalidContext");
    await expect(connected(contract, creator).createHandshake(0, "x", "", ethers.ZeroAddress, now + DAY)).to.be.revertedWithCustomError(contract, "InvalidNote");
    await expect(connected(contract, creator).createHandshake(0, "hello\nworld", "y", ethers.ZeroAddress, now + DAY)).to.be.revertedWithCustomError(contract, "InvalidContext");
    await expect(connected(contract, creator).createHandshake(0, "x", "hello 🚀", ethers.ZeroAddress, now + DAY)).to.be.revertedWithCustomError(contract, "InvalidNote");
    await expect(connected(contract, creator).createHandshake(0, "x", "y", ethers.ZeroAddress, now + 10)).to.be.revertedWithCustomError(contract, "InvalidExpiry");
    await expect(connected(contract, creator).createHandshake(0, "x", "y", creator.address, now + DAY)).to.be.revertedWithCustomError(contract, "SelfTarget");
  });

  it("enforces intended signer, self-sign and first signer wins", async () => {
    const { contract, creator, signer, other, now } = await fixture();
    await connected(contract, creator).createHandshake(2, "Code review", "The review unblocked launch.", signer.address, now + DAY);
    await expect(connected(contract, creator).cosign(1)).to.be.revertedWithCustomError(contract, "SelfSign");
    await expect(connected(contract, other).cosign(1)).to.be.revertedWithCustomError(contract, "WrongSigner");
    await connected(contract, signer).cosign(1);
    await expect(connected(contract, other).cosign(1)).to.be.revertedWithCustomError(contract, "AlreadyCompleted");
  });

  it("allows only the creator to cancel a pending unexpired card", async () => {
    const { contract, creator, signer, now } = await fixture();
    await connected(contract, creator).createHandshake(4, "Community call", "We planned the next session.", ethers.ZeroAddress, now + DAY);
    await expect(connected(contract, signer).cancelHandshake(1)).to.be.revertedWithCustomError(contract, "NotCreator");
    await expect(connected(contract, creator).cancelHandshake(1)).to.emit(contract, "HandshakeCancelled").withArgs(1, creator.address);
    expect((await contract.getHandshake(1)).cancelled).to.equal(true);
    await expect(connected(contract, signer).cosign(1)).to.be.revertedWithCustomError(contract, "AlreadyCancelled");
  });

  it("rejects expired cards and missing indexes", async () => {
    const { contract, creator, signer, now } = await fixture();
    await connected(contract, creator).createHandshake(3, "Workshop", "We learned together.", ethers.ZeroAddress, now + 3601);
    await ethers.provider.send("evm_setNextBlockTimestamp", [now + 3602]);
    await ethers.provider.send("evm_mine", []);
    await expect(connected(contract, signer).cosign(1)).to.be.revertedWithCustomError(contract, "Expired");
    await expect(contract.getHandshake(2)).to.be.revertedWithCustomError(contract, "NotFound");
    await expect(contract.getCreatedId(creator.address, 1)).to.be.revertedWithCustomError(contract, "NotFound");
  });
});
