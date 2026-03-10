import React from 'react';

function icon(paths: React.ReactNode, className = 'w-5 h-5 shrink-0', strokeWidth = 1.7) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths}
    </svg>
  );
}

export const Icons = {
  character: icon(
    <>
      <circle cx="12" cy="7" r="3.5" />
      <path d="M5 20c1.3-3.8 4.1-5.8 7-5.8s5.7 2 7 5.8" />
      <path d="M8.5 15.2l3.5 2 3.5-2" strokeWidth="1.2" />
    </>
  ),

  cyberware: icon(
    <>
      <rect x="5" y="5" width="14" height="14" rx="3" />
      <path d="M9 9h6v6H9z" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l-2-2M19 5l2-2M5 19l-2 2M19 19l2 2" strokeWidth="1.2" />
    </>
  ),

  netrunner: icon(
    <>
      <path d="M4 6h16v12H4z" />
      <path d="M8 10l2 2-2 2M12 14h4" />
      <path d="M8 3v3M16 3v3M8 18v3M16 18v3" strokeWidth="1.2" />
    </>
  ),

  weapons: icon(
    <>
      <path d="M4 16l6-6 4 4-6 6H4z" />
      <path d="M13 7l4-4 4 4-4 4z" />
      <path d="M9 11l4 4" strokeWidth="1.2" />
    </>
  ),

  armor: icon(
    <>
      <path d="M12 3l7 3v6c0 4.4-3 7.8-7 9-4-1.2-7-4.6-7-9V6l7-3z" />
      <path d="M9 10h6M12 8v6" strokeWidth="1.2" />
    </>
  ),

  gear: icon(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1" />
    </>
  ),

  about: icon(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10.2v5.3" />
      <circle cx="12" cy="7.2" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),

  close: icon(
    <>
      <path d="M6 6l12 12M18 6L6 18" />
    </>,
    'w-4 h-4 shrink-0',
    2
  ),

  attack: icon(
    <>
      <path d="M4 20l6-6" />
      <path d="M14 4h6v6" />
      <path d="M20 4L9 15" />
      <path d="M12 8l4 4" strokeWidth="1.2" />
    </>,
    'w-4 h-4 shrink-0'
  ),

  defense: icon(
    <>
      <path d="M12 3l7 3v6c0 4.4-3 7.8-7 9-4-1.2-7-4.6-7-9V6l7-3z" />
      <path d="M9.2 12.2l1.9 1.9 3.8-3.8" />
    </>,
    'w-4 h-4 shrink-0'
  ),

  booster: icon(
    <>
      <path d="M13 2L4 13h6l-1 9 9-12h-6l1-8z" />
    </>,
    'w-4 h-4 shrink-0'
  ),

  utility: icon(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1.8v3.2M12 19v3.2M4.4 4.4l2.3 2.3M17.3 17.3l2.3 2.3M1.8 12H5M19 12h3.2M4.4 19.6l2.3-2.3M17.3 6.7l2.3-2.3" />
    </>,
    'w-4 h-4 shrink-0'
  ),

  tracer: icon(
    <>
      <path d="M3 12s3.2-6 9-6 9 6 9 6-3.2 6-9 6-9-6-9-6z" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 9.5v2.5h2.5" strokeWidth="1.2" />
    </>,
    'w-4 h-4 shrink-0'
  ),

  ice: icon(
    <>
      <path d="M12 2v20M2 12h20M5 5l14 14M5 19L19 5" />
      <circle cx="12" cy="12" r="2" />
    </>,
    'w-4 h-4 shrink-0'
  ),

  daemon: icon(
    <>
      <path d="M4 7l8-4 8 4-8 4-8-4z" />
      <path d="M4 12l8 4 8-4M4 17l8 4 8-4" />
      <path d="M12 7v14" strokeWidth="1.2" />
    </>,
    'w-4 h-4 shrink-0'
  ),

  check: icon(
    <>
      <path d="M5 13l4 4L19 7" />
    </>,
    'w-4 h-4 shrink-0',
    2
  ),

  plus: icon(
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),

  minus: icon(
    <>
      <path d="M5 12h14" />
    </>,
    'w-4 h-4 shrink-0'
  ),

  warning: icon(
    <>
      <path d="M12 3l9 16H3L12 3z" />
      <path d="M12 9v4" />
      <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
    </>,
    'w-4 h-4 shrink-0'
  ),

  bug: icon(
    <>
      <path d="M9 6.5a3 3 0 0 1 6 0V8H9V6.5z" />
      <rect x="8" y="8" width="8" height="10" rx="4" />
      <path d="M5 10h3M16 10h3M5 14h3M16 14h3" strokeWidth="1.2" />
      <path d="M9 5L7.2 3.2M15 5l1.8-1.8" strokeWidth="1.2" />
    </>,
    'w-4 h-4 shrink-0'
  ),

  skull: icon(
    <>
      <path d="M12 3c-4.2 0-7 2.9-7 6.6 0 2.3 1.1 3.8 2.7 4.8V17c0 1.7 1.3 3 3 3h2.6c1.7 0 3-1.3 3-3v-2.6c1.6-1 2.7-2.5 2.7-4.8C19 5.9 16.2 3 12 3z" />
      <circle cx="9.2" cy="10.2" r="1" />
      <circle cx="14.8" cy="10.2" r="1" />
      <path d="M10 15h4M10.6 18h.01M13.4 18h.01" strokeWidth="1.2" />
    </>
  ),

  eye: icon(
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),

  brain: icon(
    <>
      <path d="M9.5 3.5a2.8 2.8 0 0 0-2.8 2.8 2.5 2.5 0 0 0-2.5 2.5 2.7 2.7 0 0 0 .5 1.6 3 3 0 0 0-.2 5.4A2.8 2.8 0 0 0 7 19.6a2.9 2.9 0 0 0 5-.7V5.5A2 2 0 0 0 9.5 3.5z" />
      <path d="M14.5 3.5a2.8 2.8 0 0 1 2.8 2.8 2.5 2.5 0 0 1 2.5 2.5 2.7 2.7 0 0 1-.5 1.6 3 3 0 0 1 .2 5.4 2.8 2.8 0 0 1-2.5 3.8 2.9 2.9 0 0 1-5-.7V5.5a2 2 0 0 1 2.5-2z" />
    </>
  ),

  hack: icon(
    <>
      <path d="M4 7l8-4 8 4-8 4-8-4z" />
      <path d="M4 12l8 4 8-4M4 17l8 4 8-4" />
      <path d="M12 11v10" strokeWidth="1.2" />
    </>
  ),

  dice: icon(
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <circle cx="9" cy="9" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="9" r="1" fill="currentColor" stroke="none" />
    </>
  ),

  save: icon(
    <>
      <path d="M5 3h11l3 3v15H5z" />
      <path d="M8 3v5h8V3" />
      <rect x="8" y="13" width="8" height="5" rx="1" />
    </>
  ),

  trash: icon(
    <>
      <path d="M4 6h16" />
      <path d="M7 6l1 14h8l1-14" />
      <path d="M9 6V4h6v2" />
      <path d="M10 10v6M14 10v6" strokeWidth="1.2" />
    </>,
    'w-4 h-4 shrink-0'
  ),

  edit: icon(
    <>
      <path d="M4 20l4.5-1L19 8.5 15.5 5 5 15.5 4 20z" />
      <path d="M13.8 6.8l3.4 3.4" />
    </>,
    'w-4 h-4 shrink-0'
  ),

  shield: icon(
    <>
      <path d="M12 3l7 3v6c0 4.2-2.8 7.6-7 9-4.2-1.4-7-4.8-7-9V6l7-3z" />
    </>
  ),

  chip: icon(
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M9 9h6v6H9z" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" strokeWidth="1.2" />
    </>
  ),

  lab: icon(
    <>
      <path d="M10 3h4" />
      <path d="M11 3v6l-5 8a2 2 0 0 0 1.7 3h8.6a2 2 0 0 0 1.7-3l-5-8V3" />
      <path d="M8 14h8" strokeWidth="1.2" />
    </>
  ),

  search: icon(
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </>,
    'w-4 h-4 shrink-0'
  ),

  programs: icon(
    <>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M9 20h6M12 17v3" />
      <path d="M8 9l2 2-2 2M12 13h4" />
    </>
  ),

  deck: icon(
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M7 8h10M7 12h10M7 16h6" />
    </>
  ),

  clock: icon(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>,
    'w-4 h-4 shrink-0'
  ),

  info: icon(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <circle cx="12" cy="8" r="0.8" fill="currentColor" stroke="none" />
    </>,
    'w-4 h-4 shrink-0'
  ),

  exit: icon(
    <>
      <path d="M10 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
      <path d="M14 16l5-4-5-4" />
      <path d="M19 12H9" />
    </>
  ),

  refresh: icon(
    <>
      <path d="M20 6v5h-5" />
      <path d="M20 11a8 8 0 1 0 2 5.2" />
    </>
  ),

  modifier: icon(
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M12 8v8M8 12h8" />
    </>,
    'w-4 h-4 shrink-0'
  ),

  health: icon(
    <>
      <path d="M12 20s-6.5-3.9-8.3-7.3A4.7 4.7 0 0 1 12 7a4.7 4.7 0 0 1 8.3 5.7C18.5 16.1 12 20 12 20z" />
      <path d="M12 9v5M9.5 11.5h5" strokeWidth="1.2" />
    </>,
    'w-4 h-4 shrink-0'
  ),

  money: icon(
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M7 9h.01M17 15h.01" strokeWidth="2" />
    </>,
    'w-4 h-4 shrink-0'
  ),

  humanity: icon(
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M12 12v4" strokeWidth="1.2" />
    </>,
    'w-4 h-4 shrink-0'
  )
};
