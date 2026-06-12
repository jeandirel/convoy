import React from "react";

export const Logo = ({ variant = "dark", size = 28 }) => {
  const height = Math.max(size + 12, 40);
  const green = "#2DA84F";

  return (
    <div className="flex items-center gap-2.5" data-testid="brand-logo">
      <img
        src="/assets/images/gastyconvoy-logo.svg"
        alt="GastyConvoy - Un convoyeur qu'on voit"
        style={{ height, width: "auto" }}
        className="block rounded bg-white"
      />
      <span className="sr-only">GastyConvoy</span>
      <div className="gc-logo-text hidden" style={{ color: variant === "light" ? "white" : undefined }}>
        <span style={{ color: variant === "light" ? "white" : "#0F2A5F" }}>Gasty</span>
        <span style={{ color: green }}>Convoy</span>
      </div>
    </div>
  );
};

export default Logo;