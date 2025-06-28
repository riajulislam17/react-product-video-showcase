import React from "react";

export const Maximize = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V8M8 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V16M21 8V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H16M21 16V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H16"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

export const Minimize = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2.99988 8H3.19988C4.88004 8 5.72011 8 6.36185 7.67302C6.92634 7.3854 7.38528 6.92646 7.6729 6.36197C7.99988 5.72024 7.99988 4.88016 7.99988 3.2V3M2.99988 16H3.19988C4.88004 16 5.72011 16 6.36185 16.327C6.92634 16.6146 7.38528 17.0735 7.6729 17.638C7.99988 18.2798 7.99988 19.1198 7.99988 20.8V21M15.9999 3V3.2C15.9999 4.88016 15.9999 5.72024 16.3269 6.36197C16.6145 6.92646 17.0734 7.3854 17.6379 7.67302C18.2796 8 19.1197 8 20.7999 8H20.9999M15.9999 21V20.8C15.9999 19.1198 15.9999 18.2798 16.3269 17.638C16.6145 17.0735 17.0734 16.6146 17.6379 16.327C18.2796 16 19.1197 16 20.7999 16H20.9999"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

export const ArrowUp = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

export const ArrowDown = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </svg>
);

export const ArrowLeft = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);

export const ArrowRight = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
