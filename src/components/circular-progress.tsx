import { useEffect, useState } from "react";

const CircularProgressBar = ({
  progress,
  size = 150,
  strokeWidth = 15,
  circleOneStroke = "stroke-foreground/10",
  circleTwoStroke = "stroke-primary",
  children,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  circleOneStroke?: string;
  circleTwoStroke?: string;
  children?: React.ReactNode;
}) => {
  // State to manage the animated progress
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Animate the progress change
  useEffect(() => {
    const animation = requestAnimationFrame(() => {
      setAnimatedProgress(progress);
    });
    return () => cancelAnimationFrame(animation);
  }, [progress]);

  // SVG parameters
  const center = size / 2;
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate the stroke dash offset
  const offset = circumference - (animatedProgress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background Circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          className={`fill-none ${circleOneStroke}`}
        />
        {/* Progress Circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          className={`fill-none ${circleTwoStroke} transition-all duration-300 ease-in-out`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {/* Percentage Text */}
      <span className="absolute text-xl font-bold ">
        {<span>{children ? children : `${animatedProgress.toFixed(0)}%`}</span>}
      </span>
    </div>
  );
};

export default CircularProgressBar;
