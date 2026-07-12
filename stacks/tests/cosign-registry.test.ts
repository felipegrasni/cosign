import { beforeEach, describe, expect, it } from "vitest";
import { initSimnet, type Simnet } from "@stacks/clarinet-sdk";
import { Cl } from "@stacks/transactions";

let simnet: Simnet;
let creator: string;
let signer: string;
let other: string;
const CONTRACT = "cosign-registry";

const expires = () => Math.floor(Date.now() / 1000) + 86_400;
const create = (target: string | null = null, sender = creator) => simnet.callPublicFn(CONTRACT, "create-handshake", [Cl.uint(1), Cl.stringAscii("Open source lounge"), Cl.stringAscii("We shipped together."), target ? Cl.some(Cl.principal(target)) : Cl.none(), Cl.uint(expires())], sender);

describe("cosign-registry", () => {
  beforeEach(async () => {
    simnet = await initSimnet("./Clarinet.toml", true);
    const accounts = simnet.getAccounts();
    creator = accounts.get("wallet_1")!; signer = accounts.get("wallet_2")!; other = accounts.get("wallet_3")!;
  });

  it("creates and indexes an open card", () => {
    const result = create();
    expect(Cl.prettyPrint(result.result)).toBe("(ok u1)");
    const count = simnet.callReadOnlyFn(CONTRACT, "get-created-count", [Cl.principal(creator)], creator);
    const id = simnet.callReadOnlyFn(CONTRACT, "get-created-id", [Cl.principal(creator), Cl.uint(0)], creator);
    expect(Cl.prettyPrint(count.result)).toBe("(ok u1)");
    expect(Cl.prettyPrint(id.result)).toBe("(ok u1)");
  });

  it("completes an addressed card and indexes the signer", () => {
    create(signer);
    expect(Cl.prettyPrint(simnet.callPublicFn(CONTRACT, "cosign", [Cl.uint(1)], signer).result)).toMatch(/^\(ok u/);
    const count = simnet.callReadOnlyFn(CONTRACT, "get-signed-count", [Cl.principal(signer)], signer);
    expect(Cl.prettyPrint(count.result)).toBe("(ok u1)");
  });

  it("rejects the creator and wrong addressed wallet", () => {
    create(signer);
    expect(Cl.prettyPrint(simnet.callPublicFn(CONTRACT, "cosign", [Cl.uint(1)], creator).result)).toBe("(err u407)");
    expect(Cl.prettyPrint(simnet.callPublicFn(CONTRACT, "cosign", [Cl.uint(1)], other).result)).toBe("(err u408)");
  });

  it("enforces first signer wins", () => {
    create();
    expect(Cl.prettyPrint(simnet.callPublicFn(CONTRACT, "cosign", [Cl.uint(1)], signer).result)).toMatch(/^\(ok u/);
    expect(Cl.prettyPrint(simnet.callPublicFn(CONTRACT, "cosign", [Cl.uint(1)], other).result)).toBe("(err u409)");
  });

  it("allows creator cancellation only", () => {
    create();
    expect(Cl.prettyPrint(simnet.callPublicFn(CONTRACT, "cancel-handshake", [Cl.uint(1)], signer).result)).toBe("(err u406)");
    expect(Cl.prettyPrint(simnet.callPublicFn(CONTRACT, "cancel-handshake", [Cl.uint(1)], creator).result)).toBe("(ok true)");
    expect(Cl.prettyPrint(simnet.callPublicFn(CONTRACT, "cosign", [Cl.uint(1)], signer).result)).toBe("(err u410)");
  });

  it("rejects invalid kind, empty text and self targeting", () => {
    const args = [Cl.uint(5), Cl.stringAscii("x"), Cl.stringAscii("y"), Cl.none(), Cl.uint(expires())];
    expect(Cl.prettyPrint(simnet.callPublicFn(CONTRACT, "create-handshake", args, creator).result)).toBe("(err u400)");
    expect(Cl.prettyPrint(simnet.callPublicFn(CONTRACT, "create-handshake", [Cl.uint(1), Cl.stringAscii(""), Cl.stringAscii("y"), Cl.none(), Cl.uint(expires())], creator).result)).toBe("(err u401)");
    expect(Cl.prettyPrint(simnet.callPublicFn(CONTRACT, "create-handshake", [Cl.uint(1), Cl.stringAscii("x"), Cl.stringAscii("y"), Cl.some(Cl.principal(creator)), Cl.uint(expires())], creator).result)).toBe("(err u404)");
    expect(Cl.prettyPrint(simnet.callPublicFn(CONTRACT, "create-handshake", [Cl.uint(1), Cl.stringAscii("x"), Cl.stringAscii("y"), Cl.none(), Cl.uint(1)], creator).result)).toBe("(err u403)");
    expect(Cl.prettyPrint(simnet.callReadOnlyFn(CONTRACT, "get-handshake", [Cl.uint(99)], creator).result)).toBe("(err u405)");
  });
});
