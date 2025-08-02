"use client";
import { useEffect } from "react";
import confetti from "canvas-confetti";

export function SuccessConfetti() {
  useEffect(() => {
    // Trigger confetti on mount with a slight delay for better effect
    const timer = setTimeout(() => {
      // Celebration sequence for successful application submission
      const colors = ["#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

      // Initial burst
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors,
      });

      // Follow-up bursts from sides
      setTimeout(() => {
        confetti({
          particleCount: 75,
          angle: 60,
          spread: 70,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 75,
          angle: 120,
          spread: 70,
          origin: { x: 1, y: 0.7 },
          colors,
        });
      }, 400);

      // Final sparkle effect
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.8 },
          colors: ["#fbbf24", "#f59e0b"],
          shapes: ["circle"],
          gravity: 0.5,
        });
      }, 800);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return null; // This component only triggers effects
}
