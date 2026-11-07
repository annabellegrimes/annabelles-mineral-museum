const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const CrystalMark = (p) => (
  <svg viewBox="0 0 32 32" {...base} {...p}>
    <path d="M16 2.5 26 10v12l-10 7.5L6 22V10Z" />
    <path d="M6 10l10 5.5L26 10M16 15.5v14" />
    <path d="M11 6.2 16 9.3l5-3.1" opacity=".55" />
  </svg>
);
export const Cube = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M12 2.8 20.5 7.5v9L12 21.2 3.5 16.5v-9Z" /><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9.2" /></svg>
);
export const Search = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></svg>
);
export const Reset = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M4 12a8 8 0 1 0 2.4-5.7" /><path d="M4 4v4.5h4.5" /></svg>
);
export const Expand = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
);
export const Shrink = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg>
);
export const Spin = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><ellipse cx="12" cy="12" rx="9" ry="3.6" /><path d="m17.5 6.5 2.3 2.3-2.9 1" /><path d="M12 5v14" opacity=".5" /></svg>
);
export const Sun = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></svg>
);
export const External = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
);
export const Close = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const Chevron = ({ dir = 'right', ...p }) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>{dir === 'right' ? <path d="m9 5 7 7-7 7" /> : <path d="m15 5-7 7 7 7" />}</svg>
);
export const Strata = (p) => (
  <svg viewBox="0 0 1200 36" preserveAspectRatio="none" {...base} strokeWidth="1" {...p}>
    <path d="M0 6c120 4 210-3 340 1s260 6 380 0 300-5 480 1" />
    <path d="M0 15c160-5 280 4 420 2s230-7 380-3 250 6 400 1" />
    <path d="M0 23c100 3 240-2 360 1s300 5 420-1 260-3 420 2" />
    <path d="M0 31c180-3 300 2 460 0s320-4 460 0 200 2 280-1" />
  </svg>
);
export const Moon = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" /></svg>
);
