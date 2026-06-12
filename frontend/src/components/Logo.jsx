import React from "react";

export const Logo = ({ variant = "dark", size = 28 }) => {
  const navy = variant === "light" ? "#FFFFFF" : "#0F2A5F";
  const green = "#2DA84F";
  return (
    <div className="flex items-center gap-2.5" data-testid="brand-logo">
      <svg width={size + 12} height={size} viewBox="0 0 64 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M4 28c4-12 14-20 28-20 10 0 18 4 24 12l4 6c.4.6 0 1.4-.7 1.4H47l-3 8H22l-3-8H6c-1 0-1.8-.8-1.8-1.8 0 0-.6 2.6-.2 2.4Z"
          fill={navy}
        />
        <circle cx="22" cy="36" r="6" fill={green} />
        <circle cx="46" cy="36" r="6" fill={green} />
        <path d="M18 18l8-4c4-2 12-2 16 0l8 4-2 4H20l-2-4Z" fill={green} opacity="0.18" />
      </svg>
      <div className="gc-logo-text" style={{ color: variant === "light" ? "white" : undefined }}>
        <span style={{ color: variant === "light" ? "white" : "#0F2A5F" }}>Gasty</span>
        <span style={{ color: green }}>Convoy</span>
      </div>
    </div>
  );
};

export default Logo;
