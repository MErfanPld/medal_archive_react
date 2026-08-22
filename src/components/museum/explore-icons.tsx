/** Line-based museum iconography — stroke 1.25 */

type IconProps = { className?: string };

export function IconMedal({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="22" r="11" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="20" cy="22" r="6.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M14 6h12l-2 8H16L14 6z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M17 6v-2h6v2" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function IconCoin({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="20" r="13" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="20" cy="20" r="9" stroke="currentColor" strokeWidth="1.25" strokeDasharray="2 2.5" />
      <path d="M20 13v14M15 17.5c1.2-1.5 3-2.2 5-2.2s3.8.7 5 2.2M15 22.5c1.2 1.5 3 2.2 5 2.2s3.8-.7 5-2.2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function IconEmblem({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden>
      <path d="M20 6l10 4v8c0 7-4.5 12.5-10 14.5C14.5 30.5 10 25 10 18V10l10-4z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M20 14v10M16 18h8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function IconLaurel({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden>
      <path d="M20 32V14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M20 16c-4-3-9-3-12-1 2 4 6 7 12 8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M20 16c4-3 9-3 12-1-2 4-6 7-12 8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M20 22c-3.5-2-7.5-2-10.5-.5 1.5 3 4.5 5 10.5 5.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M20 22c3.5-2 7.5-2 10.5-.5-1.5 3-4.5 5-10.5 5.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <circle cx="20" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function IconInsignia({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden>
      <path d="M20 8l3 7h7l-5.5 4.5 2 7L20 22.5 13.5 26.5l2-7L10 15h7l3-7z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="1.25" opacity="0.35" />
    </svg>
  );
}

export function IconAncientCoin({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden>
      <ellipse cx="20" cy="20" rx="13" ry="12" stroke="currentColor" strokeWidth="1.25" />
      <path d="M12 14c3 2 5 6 5 10s-2 8-5 10M28 14c-3 2-5 6-5 10s2 8 5 10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.5" />
      <path d="M17 18h6M17 22h6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}
