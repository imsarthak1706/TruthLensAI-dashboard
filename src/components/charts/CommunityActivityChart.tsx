import React from "react";

export function CommunityActivityChart() {
  return (
    <div className="w-full h-full relative">
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 150">
        <defs>
          <linearGradient id="communityChartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6fdd78" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6fdd78" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <g className="stroke-[#30363D] stroke-[1] [stroke-dasharray:4]">
          <line x1="0" x2="500" y1="30" y2="30" />
          <line x1="0" x2="500" y1="75" y2="75" />
          <line x1="0" x2="500" y1="120" y2="120" />
        </g>
        <path
          className="fill-[url(#communityChartGradient)] opacity-20"
          d="M0,150 L0,100 Q50,120 100,80 T200,60 T300,90 T400,40 T500,20 L500,150 Z"
        />
        <path
          className="stroke-primary stroke-2 fill-none"
          d="M0,100 Q50,120 100,80 T200,60 T300,90 T400,40 T500,20"
        />
      </svg>
    </div>
  );
}
