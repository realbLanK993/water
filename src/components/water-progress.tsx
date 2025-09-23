import { useState, useEffect, useRef } from "react";

// Type definition for Wave component props
type WaveProps = {
  y: number;
  phase: number;
  color: string;
  opacity: string | number;
};

// A reusable SVG Wave component for the water effect
const Wave = ({ y, phase, color, opacity }: WaveProps) => {
  // We create a path that is much wider than the viewbox to allow for smooth horizontal animation
  const path = `
        M -200 ${y}
        C -150 ${y - 20}, -100 ${y - 20}, -50 ${y}
        S 0 ${y + 20}, 50 ${y}
        S 100 ${y - 20}, 150 ${y}
        S 200 ${y + 20}, 250 ${y}
        S 300 ${y - 20}, 350 ${y}
        V 200 H -200 Z
    `;

  return (
    <path
      d={path}
      fill={color}
      opacity={opacity}
      transform={`translate(${phase}, 0)`}
      className="transition-transform duration-1000 ease-in-out"
    />
  );
};

// Type definition for WaterProgressBar component props
type WaterProgressBarProps = {
  progress: number;
  size?: number;
  children?: React.ReactNode;
};

// The new WaterProgressBar component
const WaterProgressBar = ({
  progress,
  size = 150,
  children,
}: WaterProgressBarProps) => {
  const [phase, setPhase] = useState(0);
  // Correctly type the ref to hold a number (for the animation frame ID) or null.
  const animationRef = useRef<number | null>(null);

  // Animation loop for the wave effect
  const animateWave = () => {
    setPhase((prev) => (prev + 0.5) % 200);
    animationRef.current = requestAnimationFrame(animateWave);
  };

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animateWave);
    // Ensure the ref has a value before trying to cancel the animation frame.
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const center = size / 2;
  const radius = size * 0.45; // Slightly smaller radius for padding
  const clipPathId = "circle-clip";

  // Calculate the vertical position of the water based on progress
  // 100% progress means y is at the top, 0% means y is at the bottom
  const waterY = size * (1 - progress / 100);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <clipPath id={clipPathId}>
            <circle cx={center} cy={center} r={radius} />
          </clipPath>
        </defs>

        {/* Background of the circle */}
        <circle cx={center} cy={center} r={radius} fill="#e0f2fe" />

        {/* Group to contain the waves, clipped by the circle */}
        <g clipPath={`url(#${clipPathId})`}>
          {/* Two waves with different phases and opacities for a depth effect */}
          <Wave y={waterY} phase={phase} color="#0ea5e9" opacity="0.6" />
          <Wave y={waterY} phase={-phase + 100} color="#38bdf8" opacity="1" />
        </g>

        {/* Outline of the circle */}
      </svg>
      <span className="absolute text-xl font-bold text-white drop-shadow-md">
        {children ? children : `${progress}%`}
      </span>
    </div>
  );
};

export default WaterProgressBar;
