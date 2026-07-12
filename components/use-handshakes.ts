"use client";

import { useCallback, useEffect, useState } from "react";
import { PAGE_SIZE } from "@/lib/cosign";
import type { Handshake, HandshakeRepository } from "@/lib/types";

export function useHandshakeList(repository: HandshakeRepository, address: string, role: "created" | "signed") {
  const [items, setItems] = useState<Handshake[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    if (!address || !repository.configured) { setItems([]); return; }
    setLoading(true); setError("");
    try {
      const total = role === "created" ? await repository.getCreatedCount(address) : await repository.getSignedCount(address);
      const numericTotal = Number(total);
      setTotal(numericTotal);
      const remaining = Math.max(0, numericTotal - page * PAGE_SIZE);
      const take = Math.min(remaining, PAGE_SIZE);
      const start = BigInt(Math.max(0, numericTotal - (page + 1) * PAGE_SIZE));
      const ids = role === "created"
        ? await repository.getCreatedIds(address, start, take)
        : await repository.getSignedIds(address, start, take);
      const cards = await Promise.all(ids.reverse().map((id) => repository.getHandshake(id)));
      setItems(cards.filter((item): item is Handshake => Boolean(item)));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load cards."); }
    finally { setLoading(false); }
  }, [address, page, repository, role]);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  return { items, loading, error, refresh: load, page, setPage, total, hasNext: (page + 1) * PAGE_SIZE < total, hasPrevious: page > 0 };
}
