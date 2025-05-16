import React from "react";

const Boat = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className || "w-6 h-6"}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 16l9-7 9 7v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 22V12l3-2 3 2v10"
    />
  </svg>
);

export default Boat;
