import type { ReactNode } from "react";

const icons = {
  arrow: <path d="M3 12h17m-6-6 6 6-6 6" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 10h18" /></>,
  "calendar-star": <><path d="M12 21H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4M7 3v4m10-4v4M3 10h18" /><path d="m18 13 1.2 2.5 2.8.4-2 2 .5 2.8-2.5-1.4-2.5 1.4.5-2.8-2-2 2.8-.4Z" /></>,
  chef: <path d="M6 13a4.3 4.3 0 1 1 2.2-8A4.4 4.4 0 0 1 16 5a4.3 4.3 0 1 1 2 8v8H6zm0 5h12" />,
  clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6h5" /></>,
  cutlery: <path d="M3 3c-2 2 1 7 5 8l3 1 8 9a1.5 1.5 0 0 0 2-2L4 3zm17 0-5 5m7-2-5 5m0-9-5 5a3 3 0 0 0 0 4l-9 8a1.5 1.5 0 1 0 2 2l8-9a3 3 0 0 0 4 0l5-5" />,
  download: <path d="M12 2v13m-5-5 5 5 5-5M3 14v6a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-6" />,
  group: <><circle cx="12" cy="7" r="3.6" /><path d="M17.8 3.9a3.3 3.3 0 0 1 .6 6.4M6.2 3.9a3.3 3.3 0 0 0-.6 6.4M12 12c-3.5 0-6 2.3-6 5.4V21h12v-3.6c0-3.1-2.5-5.4-6-5.4Zm5.9-.1c2.6.2 4.1 1.9 4.1 4.1v2h-2.3M6.1 11.9C3.5 12.1 2 13.8 2 16v2h2.3" /></>,
  info: <><circle cx="12" cy="12" r="10" /><path d="M12 11v6m0-10h.01" /></>,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>,
  phone: <path d="M7.7 3.5 10 7a1 1 0 0 1-.2 1.3L8 10.1a14.4 14.4 0 0 0 5.9 5.9l1.8-1.8a1 1 0 0 1 1.3-.2l3.5 2.3a1 1 0 0 1 .3 1.4L19.4 20c-.5.8-1.6 1.1-2.6.9A19 19 0 0 1 3.1 7.2c-.2-1 .1-2.1.9-2.6l2.3-1.4a1 1 0 0 1 1.4.3Z" />,
  pin: <><path d="M20 10c0 5.3-8 12-8 12S4 15.3 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  user: <><circle cx="12" cy="7" r="4" /><path d="M4 21v-2a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v2" /></>,
  vk: <path d="M2 6h4c.6 4.7 3.1 7 4.5 7.4V6H14v4.2c1.4-.2 3.3-2 4.1-4.2H22c-.6 2.5-2.3 4.7-4.5 6 2.2 1.1 3.9 3 4.7 5.8H18c-.7-2.1-2.2-3.7-4-3.9v3.9h-1C7 17.8 3 13.5 2 6Z" />,
} satisfies Record<string, ReactNode>;

export function LineIcon({ name }: { name: keyof typeof icons }) {
  return (
    <svg className="line-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {icons[name]}
    </svg>
  );
}
