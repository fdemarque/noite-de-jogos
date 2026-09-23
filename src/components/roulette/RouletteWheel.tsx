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

interface ComputedSlice {
  item: PrendaItem;
  startAngle: number;
  endAngle: number;
  sliceAngle: number;
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

  // Compute total weight and angular partitions for each active slice
  const getComputedSlices = useCallback((): ComputedSlice[] => {
    if (activeItems.length === 0) return [];

    const totalWeight = activeItems.reduce(
      (sum, item) => sum + Math.max(item.weight || 1, 1),
      0
    );

    let currentAngle = 0;
    return activeItems.map((item) => {
      const weight = Math.max(item.weight || 1, 1);
      const sliceAngle = (2 * Math.PI * weight) / totalWeight;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle = endAngle;

      return {
        item,
        startAngle,
        endAngle,
        sliceAngle,
      };
    });
  }, [activeItems]);

  // Render wheel on canvas
  const drawWheel = useCallback(
    (currentRotation: number) => {
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

      const slices = getComputedSlices();

      if (slices.length === 0) {
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

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(currentRotation);

      // Draw each slice with proportional angle
      slices.forEach((slice) => {
        const { item, startAngle, endAngle, sliceAngle } = slice;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.closePath();

        // Slice background
        ctx.fillStyle = item.color;
        ctx.fill();

        // Slice border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Render text positioned at 70% of radius (r * 0.70) with centered anchoring
        ctx.save();
        const midAngle = startAngle + sliceAngle / 2;
        ctx.rotate(midAngle);
        ctx.translate(radius * 0.70, 0);

        // Center anchored text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Adapt font size and truncation based on slice width
        const fontSize = sliceAngle < 0.5 ? 10 : sliceAngle < 0.8 ? 12 : 13;
        const maxChars = sliceAngle < 0.5 ? 12 : sliceAngle < 0.8 ? 16 : 20;

        ctx.font = `bold ${fontSize}px "Plus Jakarta Sans", sans-serif`;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillStyle = '#FFFFFF';

        let displayText = item.text;
        if (displayText.length > maxChars) {
          displayText = displayText.slice(0, maxChars - 2) + '...';
        }

        ctx.fillText(displayText, 0, 0);
        ctx.restore();
      });

      // Outer decorative rim
      ctx.beginPath();
      ctx.arc(0, 0, radius + 2, 0, 2 * Math.PI);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Rivets / Pegs around border at each slice boundary
      slices.forEach((slice) => {
        const pegX = Math.cos(slice.startAngle) * (radius - 2);
        const pegY = Math.sin(slice.startAngle) * (radius - 2);

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
      const hubGrad = ctx.createLinearGradient(
        centerX - 30,
        centerY - 30,
        centerX + 30,
        centerY + 30
      );
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
    },
    [getComputedSlices]
  );

  // Initial draw & redraw on items change
  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [drawWheel]);

  // Spin physics engine with weighted probability and safe landing point
  const spinWheel = () => {
    if (isSpinning || activeItems.length === 0) return;

    const slices = getComputedSlices();
    if (slices.length === 0) return;

    sound.playPop();
    setIsSpinning(true);

    // 1. Sorteio ponderado via distribuição cumulativa de probabilidade
    const totalWeight = activeItems.reduce(
      (sum, item) => sum + Math.max(item.weight || 1, 1),
      0
    );
    const randomWeight = Math.random() * totalWeight;

    let cumulative = 0;
    let chosenSlice = slices[0];

    for (let i = 0; i < slices.length; i++) {
      cumulative += Math.max(slices[i].item.weight || 1, 1);
      if (randomWeight < cumulative) {
        chosenSlice = slices[i];
        break;
      }
    }

    // 2. Escolher um ponto de pouso seguro dentro da fatia sorteada (20% a 80% do arco)
    // Isso garante que a agulha não pare exatamente sobre a linha divisória
    const safeOffsetRatio = 0.2 + Math.random() * 0.6;
    const targetSliceAngle =
      chosenSlice.startAngle + chosenSlice.sliceAngle * safeOffsetRatio;

    // 3. O ponteiro fixo fica no topo do canvas: 3*PI/2 (270 graus)
    const pointerAngle = (3 * Math.PI) / 2;

    // Para o ângulo do disco coincidir com a agulha no topo:
    // (targetRotation + targetSliceAngle) % 2PI == pointerAngle
    // => targetNormalizedRotation = (pointerAngle - targetSliceAngle + 2PI) % 2PI
    const targetNormRotation =
      (pointerAngle - (targetSliceAngle % (2 * Math.PI)) + 2 * Math.PI) %
      (2 * Math.PI);

    const startRotation = rotationRef.current;
    const currentNorm =
      ((startRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const diff =
      (targetNormRotation - currentNorm + 2 * Math.PI) % (2 * Math.PI);

    // 5 a 8 giros completos adicionais para sensação física realista
    const fullSpins = 5 + Math.floor(Math.random() * 4);
    const totalRotation = fullSpins * 2 * Math.PI + diff;

    const duration = 4500; // 4.5 segundos de desaceleração suave
    const startTime = performance.now();
    let lastSliceId = '';

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic para desaceleração natural
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + totalRotation * easeProgress;
      rotationRef.current = currentRotation;

      drawWheel(currentRotation);

      // Determinar fatia sob o ponteiro para efeito sonoro de tick
      const normalizedAngle =
        (pointerAngle - (currentRotation % (2 * Math.PI)) + 2 * Math.PI) %
        (2 * Math.PI);

      const activeSliceUnderNeedle = slices.find(
        (s) => normalizedAngle >= s.startAngle && normalizedAngle < s.endAngle
      );

      if (
        activeSliceUnderNeedle &&
        activeSliceUnderNeedle.item.id !== lastSliceId
      ) {
        lastSliceId = activeSliceUnderNeedle.item.id;
        const speedRatio = 1 - progress;
        sound.playTick(500 + speedRatio * 350);
        setNeedleBounce(true);
        setTimeout(() => setNeedleBounce(false), 50);
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Giro concluído exatamente na fatia sorteada com margem segura
        setIsSpinning(false);

        sound.playWin();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#A0C4FF', '#FFC6FF', '#BEE1E6', '#FDE2E4', '#FFD166'],
        });

        onWinner(chosenSlice.item);
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
