import { GraduationCap, HandHeart, Hammer, MessageCircle, Sparkles } from "lucide-react";
import type { HandshakeKind } from "@/lib/types";

export function CategoryIcon({ kind, size = 20 }: { kind: HandshakeKind; size?: number }) {
  const props = { size, strokeWidth: 2.2, "aria-hidden": true } as const;
  if (kind === 0) return <MessageCircle {...props} />;
  if (kind === 1) return <Hammer {...props} />;
  if (kind === 2) return <HandHeart {...props} />;
  if (kind === 3) return <GraduationCap {...props} />;
  return <Sparkles {...props} />;
}
