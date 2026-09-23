import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { PrendaItem } from '../../types';
import { sound } from '../../hooks/useAudio';

interface RouletteWheelProps {
  items: PrendaItem[];
  onWinner: (item: PrendaItem) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

export const RouletteWheel: React.FC<RouletteWheelProps> = ({
  items,
  onWinner,
  isSpinning,
  setIsSpinning,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const [needleBounce, setNeedleBounce] = useState(false);

  // Active items only
  const activeItems = items.filter((item) => item.active);

  // Render wheel on canvas
  const drawWheel = useCallback((currentRotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 24;

    ctx.clearRect(0, 0, width, height);

    if (activeItems.length === 0) {
      // Empty wheel state
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#E2E8F0';
      ctx.fill();
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Ative itens para girar!', centerX, centerY);
      return;
    }

    const sliceAngle = (2 * Math.PI) / activeItems.length;

    // Draw slices
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentRotation);

    activeItems.forEach((item, index) => {
      const startAngle = index * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      // Vibrant slice background
      ctx.fillStyle = item.color;
      ctx.fill();

      // Slice border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Render text along slice
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Contrast text styling
      ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillStyle = '#FFFFFF';

      // Truncate long text if needed
      let displayText = item.text;
      if (displayText.length > 20) {
        displayText = displayText.slice(0, 18) + '...';
      }

      ctx.fillText(displayText, radius - 20, 0);
      ctx.restore();
    });

    // Outer decorative rim
    ctx.beginPath();
    ctx.arc(0, 0, radius + 2, 0, 2 * Math.PI);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Rivets / Pegs around border
    activeItems.forEach((_, index) => {
      const pegAngle = index * sliceAngle;
      const pegX = Math.cos(pegAngle) * (radius - 2);
      const pegY = Math.sin(pegAngle) * (radius - 2);

      ctx.beginPath();
      ctx.arc(pegX, pegY, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 3;
      ctx.fill();
    });

    ctx.restore();

    // Outer Shadow ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.restore();

    // Center Hub (Glass / Golden badge)
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 38, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 32, 0, 2 * Math.PI);
    const hubGrad = ctx.createLinearGradient(centerX - 30, centerY - 30, centerX + 30, centerY + 30);
    hubGrad.addColorStop(0, '#A0C4FF');
    hubGrad.addColorStop(1, '#FFC6FF');
    ctx.fillStyle = hubGrad;
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 4;
    ctx.fillText('GIRAR', centerX, centerY);
    ctx.restore();
  }, [activeItems]);

  // Initial draw & redraw on items change
  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [drawWheel]);

  // Spin physics engine
  const spinWheel = () => {
    if (isSpinning || activeItems.length === 0) return;

    sound.playPop();
    setIsSpinning(true);

    const fullSpins = 5 + Math.floor(Math.random() * 4); // 5 to 8 full spins
    const randomOffset = Math.random() * 2 * Math.PI;
    const totalRotation = fullSpins * 2 * Math.PI + randomOffset;

    const startRotation = rotationRef.current;
    const duration = 4500; // 4.5 seconds of smooth physical easing
    const startTime = performance.now();

    const sliceAngle = (2 * Math.PI) / activeItems.length;
    let lastSliceIndex = -1;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic for realistic decelerating spin physics
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + totalRotation * easeProgress;
      rotationRef.current = currentRotation;

      drawWheel(currentRotation);

      // Calculate slice under needle (pointer is at top: 3 * Math.PI / 2 or -Math.PI / 2)
      // Normalize rotation to [0, 2PI)
      const pointerAngle = (3 * Math.PI) / 2;
      const normalizedAngle = (pointerAngle - (currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const currentSliceIndex = Math.floor(normalizedAngle / sliceAngle);

      if (currentSliceIndex !== lastSliceIndex) {
        lastSliceIndex = currentSliceIndex;
        // Pitch shifts with speed
        const speedRatio = 1 - progress;
        sound.playTick(500 + speedRatio * 350);
        setNeedleBounce(true);
        setTimeout(() => setNeedleBounce(false), 50);
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Complete spin
        setIsSpinning(false);
        const winningItem = activeItems[currentSliceIndex % activeItems.length];

        sound.playWin();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#A0C4FF', '#FFC6FF', '#BEE1E6', '#FDE2E4', '#FFD166'],
        });

        if (winningItem) {
          onWinner(winningItem);
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center my-2">
      {/* Top Fixed Needle Pointer */}
      <div className="absolute -top-3 z-20 flex flex-col items-center">
        <div
          className={`w-6 h-9 transition-transform duration-75 origin-top filter drop-shadow-md ${
            needleBounce ? '-rotate-12 scale-110' : 'rotate-0'
          }`}
        >
          <svg viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 36L2 6C0.5 3 2.5 0 6 0H18C21.5 0 23.5 3 22 6L12 36Z"
              fill="#1E293B"
            />
            <circle cx="12" cy="7" r="4" fill="#FFC6FF" />
          </svg>
        </div>
      </div>

      {/* Wheel Canvas Container */}
      <div
        onClick={spinWheel}
        className={`relative rounded-full shadow-soft-lg cursor-pointer transition-transform active:scale-[0.99] ${
          isSpinning ? 'pointer-events-none' : ''
        }`}
      >
        <canvas
          ref={canvasRef}
          width={340}
          height={340}
          className="w-[300px] h-[300px] sm:w-[340px] sm:h-[340px] block"
        />
      </div>
    </div>
  );
};
