import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CreateWizard } from "@/components/create-wizard";
import type { HandshakeRepository } from "@/lib/types";

const repository: HandshakeRepository = {
  network: "celo", configured: true, getTotal: vi.fn(async () => 1n), getHandshake: vi.fn(),
  getCreatedCount: vi.fn(), getSignedCount: vi.fn(), getCreatedIds: vi.fn(), getSignedIds: vi.fn(),
  create: vi.fn(async () => ({ hash: "0x1", explorerUrl: "https://example.test/0x1" })), cosign: vi.fn(), cancel: vi.fn()
};

describe("CreateWizard", () => {
  it("completes the public three-step flow", async () => {
    const user = userEvent.setup();
    const created = vi.fn();
    render(<CreateWizard network="celo" account="0x1111111111111111111111111111111111111111" repository={repository} onClose={vi.fn()} onCreated={created} />);
    await user.click(screen.getByRole("button", { name: /Built/ }));
    await user.click(screen.getByRole("button", { name: /Continue/ }));
    await user.type(screen.getByLabelText(/Context/), "Open source lounge");
    await user.type(screen.getByLabelText(/Note/), "We shipped together.");
    await user.click(screen.getByRole("button", { name: /Continue/ }));
    expect(screen.getByText(/Public and permanent/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Create CoSign/ }));
    expect(repository.create).toHaveBeenCalled();
    expect(created).toHaveBeenCalledWith(1n, expect.objectContaining({ hash: "0x1" }));
  });

  it("blocks non-ASCII notes", async () => {
    const user = userEvent.setup();
    render(<CreateWizard network="celo" account="0x1111111111111111111111111111111111111111" repository={repository} onClose={vi.fn()} onCreated={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /Continue/ }));
    await user.type(screen.getByLabelText(/Context/), "Meetup");
    await user.type(screen.getByLabelText(/Note/), "Great chat 🚀");
    expect(screen.getByText(/ASCII/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue/ })).toBeDisabled();
  });

  it("shows the transaction hash while confirmation is pending", async () => {
    const user = userEvent.setup();
    let confirm!: (value: { hash: string; explorerUrl: string }) => void;
    const pendingRepository: HandshakeRepository = {
      ...repository,
      create: vi.fn(async (_input, onTransaction) => {
        onTransaction?.({ phase: "awaiting-signature", message: "Approve the transaction in your Stacks wallet." });
        onTransaction?.({ phase: "confirming", message: "Transaction submitted. Waiting for Stacks confirmation.", hash: "0xabc", explorerUrl: "https://example.test/0xabc" });
        return new Promise<{ hash: string; explorerUrl: string }>((resolve) => { confirm = resolve; });
      })
    };
    const created = vi.fn();
    render(<CreateWizard network="stacks" account="SP3SABCDE123456789012345678901234567890" repository={pendingRepository} onClose={vi.fn()} onCreated={created} />);
    await user.click(screen.getByRole("button", { name: /Continue/ }));
    await user.type(screen.getByLabelText(/Context/), "Open source lounge");
    await user.type(screen.getByLabelText(/Note/), "We shipped together.");
    await user.click(screen.getByRole("button", { name: /Continue/ }));
    await user.click(screen.getByRole("button", { name: /Create CoSign/ }));
    expect(await screen.findByText("Transaction submitted")).toBeInTheDocument();
    expect(screen.getByText(/Waiting for Stacks confirmation/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View transaction/ })).toHaveAttribute("href", "https://example.test/0xabc");
    expect(screen.getByRole("button", { name: /Confirming on Stacks/ })).toBeDisabled();
    confirm({ hash: "0xabc", explorerUrl: "https://example.test/0xabc" });
    await waitFor(() => expect(created).toHaveBeenCalledWith(1n, expect.objectContaining({ hash: "0xabc" })));
  });
});
