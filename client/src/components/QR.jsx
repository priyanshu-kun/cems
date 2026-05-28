// Stylized QR placeholder. Renders a deterministic SVG that LOOKS like a QR
// code for any string input. For real production, drop in a proper QR lib
// (qrcode, qr-code-styling, etc.) and replace this component.

export function QRPlaceholder({ seed = "abc", className = "" }) {
  const N = 25;
  const cells = [];

  // FNV-1a hash → seeded PRNG
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  let r = h >>> 0;
  const next = () => { r ^= r << 13; r ^= r >>> 17; r ^= r << 5; r >>>= 0; return r / 0xffffffff; };

  const isFinder = (x, y) => (
    (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7)
  );

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (isFinder(x, y)) continue;
      if (next() < 0.5) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#0F172A" />);
    }
  }

  const finder = (ox, oy, key) => (
    <g key={key}>
      <rect x={ox} y={oy} width={7} height={7} fill="#0F172A" />
      <rect x={ox + 1} y={oy + 1} width={5} height={5} fill="#fff" />
      <rect x={ox + 2} y={oy + 2} width={3} height={3} fill="#0F172A" />
    </g>
  );

  return (
    <svg
      className={`qr-svg ${className}`}
      viewBox={`0 0 ${N} ${N}`}
      width="100%"
      height="100%"
      shapeRendering="crispEdges"
      role="img"
      aria-label="QR code"
    >
      <rect width={N} height={N} fill="#fff" />
      {cells}
      {finder(0, 0, "tl")}
      {finder(N - 7, 0, "tr")}
      {finder(0, N - 7, "bl")}
    </svg>
  );
}
