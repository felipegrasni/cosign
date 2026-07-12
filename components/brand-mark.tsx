import type { SVGProps } from "react";

export function BrandMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true" {...props}>
      <path d="M27 13H19C10.7 13 4 19.7 4 28s6.7 15 15 15h8" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <path d="M37 51h8c8.3 0 15-6.7 15-15s-6.7-15-15-15h-8" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <path d="m22 31 7 7 14-16" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
