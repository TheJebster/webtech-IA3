// RentKit logo: yellow monogram on a dark rounded tile (same artwork as public/favicon.svg)
export default function BrandMark({ size = 32 }) {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 128 128">
        <rect width="128" height="128" rx="32" fill="#1C1C1E" />
        <g fill="none" stroke="#E8ED6B" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 35 40 h 42 a 16 16 0 0 1 0 32 h -28 a 14 14 0 0 0 -14 14 v 2" />
          <path d="M 68 72 c 8 0, 12 4, 22 16" />
        </g>
      </svg>
    </span>
  );
}
