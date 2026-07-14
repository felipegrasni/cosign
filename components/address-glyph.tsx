import { useMemo } from "react";

export function AddressGlyph({ address, size = 44 }: { address: string; size?: number }) {
  const cells = useMemo(() => {
    let hash = 2166136261;
    for (const char of address.toLowerCase()) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
    return Array.from({ length: 15 }, (_, index) => ((hash >>> (index % 24)) + index * 13) % 2 === 0);
  }, [address]);
  const color = useMemo(() => {
    const total = Array.from(address).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return ["#ff654a", "#20b8a6", "#7c65d8", "#e5a11a"][total % 4];
  }, [address]);

  return (
    <svg width={size} height={size} viewBox="0 0 50 50" className="address-glyph" aria-hidden="true" focusable="false">
      <rect width="50" height="50" rx="14" fill="#fffaf2" />
      {Array.from({ length: 5 }, (_, y) => Array.from({ length: 5 }, (_, x) => {
        const sourceX = x > 2 ? 4 - x : x;
        const active = cells[y * 3 + sourceX];
        return active ? <rect key={`${x}-${y}`} x={7 + x * 7.5} y={7 + y * 7.5} width="6" height="6" rx="2" fill={color} /> : null;
      }))}
    </svg>
  );
}
