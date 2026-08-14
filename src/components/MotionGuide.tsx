import { useEffect, useState } from "react";

interface MotionGuideProps {
  frames: readonly string[];
  name: string;
  mirrored?: boolean;
  decorative?: boolean;
}

export function MotionGuide({ frames, name, mirrored = false, decorative = false }: MotionGuideProps) {
  const [activeFrame, setActiveFrame] = useState(0);
  const visibleFrame = activeFrame % frames.length;

  useEffect(() => {
    if (frames.length < 2) return;

    const interval = window.setInterval(() => {
      setActiveFrame((current) => (current + 1) % frames.length);
    }, 900);

    return () => window.clearInterval(interval);
  }, [frames]);

  return (
    <span
      className={`exercise-motion${mirrored ? " exercise-motion--mirrored" : ""}`}
      aria-label={decorative ? undefined : `Motion guide for ${name}`}
      aria-hidden={decorative}
    >
      {frames.map((frame, index) => (
        <img
          className={index === visibleFrame ? "exercise-motion__frame exercise-motion__frame--active" : "exercise-motion__frame"}
          src={`${import.meta.env.BASE_URL}${frame}`}
          alt={!decorative && index === 0 ? `Illustration for ${name}` : ""}
          aria-hidden={decorative || index > 0}
          key={frame}
        />
      ))}
    </span>
  );
}
