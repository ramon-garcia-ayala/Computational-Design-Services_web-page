/**
 * Line icons for the proposal blocks. 1.5 stroke on a 24 viewBox,
 * `currentColor` throughout, no fill: they inherit the container's color and
 * never introduce a new palette into the site.
 */

const paths = {
  layers: <><path d="M12 3 3 8l9 5 9-5-9-5Z" /><path d="M3 13l9 5 9-5" /></>,
  grid: <><path d="M4 4h16v16H4z" /><path d="M4 9h16M9 4v16" /></>,
  cropMarks: <><path d="M7 7h10v10H7z" /><path d="M3 3h6M15 3h6M3 21h6M15 21h6" /></>,
  rules: <path d="M3 12h18M3 6h18M3 18h18" />,
  window: <><rect x="4" y="4" width="16" height="16" rx="1" /><path d="M4 9h16M9 4v5" /></>,
  mapPin: <><circle cx="12" cy="10" r="3" /><path d="M12 21c4-4.5 7-8.2 7-11a7 7 0 0 0-14 0c0 2.8 3 6.5 7 11Z" /></>,
  nested: <><rect x="5" y="5" width="14" height="14" rx="1" /><path d="M9 9h6v6H9z" /></>,
  check: <path d="m4 12 5 5L20 6" />,
  flag: <><path d="M5 21V4" /><path d="M5 5h12l-2.5 4L17 13H5" /></>,
  file: <><path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7Z" /><path d="M14 3v4h4" /></>,
  spreadsheet: <><rect x="3" y="4" width="18" height="16" rx="1" /><path d="M3 10h18M9 10v10M15 10v10" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="1" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  cube: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></>,
  cpu: <><rect x="7" y="7" width="10" height="10" rx="1" /><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" /></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="1.5" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  route: <><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.5 6H15a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h6.5" /></>,
  alert: <><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4M12 17.5v.5" /></>,
} as const;

export type IconName = keyof typeof paths;

export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
