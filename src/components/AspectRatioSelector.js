// AspectRatioSelector.js
import React from "react";

const AspectRatioSelector = ({ onSelect }) => {
  const ratios = ["16:9", "4:3", "1:1"];

  return (
    <div className="aspect-ratio-selector">
      {ratios.map((ratio) => (
        <button key={ratio} onClick={() => onSelect(ratio)}>
          {ratio}
        </button>
      ))}
    </div>
  );
};

export default AspectRatioSelector;
