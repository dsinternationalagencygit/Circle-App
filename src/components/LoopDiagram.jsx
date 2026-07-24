import { useEffect, useRef } from 'react';
import { motion, useAnimate, useMotionValue, animate } from 'framer-motion';

/* ----------------------------------------------------------------
   LoopDiagram — animated SVG habit loop
   320×320 viewBox, diamond layout:
     CUE     (top)    cx=160, cy=52
     CRAVING (right)  cx=268, cy=160
     HABIT   (bottom) cx=160, cy=268
     REWARD  (left)   cx=52,  cy=160

   Animation sequence (11 steps, exact per spec):
     1. Outer ring draws (stroke-dashoffset) 600ms
     2. CUE node fades + scales in 400ms
     3. Arc CUE→CRAVING draws 300ms
     4. CRAVING node fades + scales in 400ms
     5. Arc CRAVING→HABIT draws 300ms
     6. HABIT node fades + scale-spring 400ms
     7. Arc HABIT→REWARD (red, 2px) draws + "false reward" label 400ms
     8. REWARD node fades + scales in 400ms
     9. Arc REWARD→CUE (amber) draws + "sets up next trigger" label 400ms
    10. HABIT→REWARD arc: continuous opacity pulse (0.6↔1.0, 2s loop, never stops)
    11. "Your Loop" label fades in 300ms (500ms after diagram done — done in LoopScreen)
   ---------------------------------------------------------------- */

const NODE_R = 28; // radius = 28px → 56px diameter

// Node centres in 320×320 viewBox (diamond)
const NODES = {
  CUE:     { cx: 160, cy: 52,  label: 'CUE',     answerKey: 'when'    },
  CRAVING: { cx: 268, cy: 160, label: 'CRAVING',  answerKey: 'trigger' },
  HABIT:   { cx: 160, cy: 268, label: 'HABIT',    answerKey: 'habit'   },
  REWARD:  { cx: 52,  cy: 160, label: 'REWARD',   answerKey: 'feeling' },
};

// Return the point on a circle's perimeter towards a target direction
function edgePt(node, dx, dy) {
  const len = Math.sqrt(dx * dx + dy * dy);
  return {
    x: node.cx + (dx / len) * (NODE_R + 2),
    y: node.cy + (dy / len) * (NODE_R + 2),
  };
}

// Build quadratic Bézier path (M startX startY Q cpx cpy endX endY)
function arcPath(fromKey, toKey, cpx, cpy) {
  const from = NODES[fromKey];
  const to   = NODES[toKey];

  // Direction from 'from' towards control point
  const start = edgePt(from, cpx - from.cx, cpy - from.cy);
  // Direction into 'to' from control point
  const end   = edgePt(to,   to.cx - cpx,   to.cy - cpy);

  return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} Q ${cpx} ${cpy} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
}

// Arrowhead marker
function Marker({ id, color }) {
  return (
    <marker id={id} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
      <polygon points="0 0, 7 3.5, 0 7" fill={color} />
    </marker>
  );
}

/* AnimatedArc — draws via stroke-dashoffset, starts its own timer */
function AnimatedArc({ id, fromKey, toKey, cpx, cpy, color, strokeWidth, delay, isPulse }) {
  const pathRef = useRef(null);
  const pulseOpacity = useMotionValue(1);

  useEffect(() => {
    let active = true;
    const path = pathRef.current;
    if (!path) return;

    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;

    const timer = setTimeout(async () => {
      if (!active) return;
      // Draw the arc
      await animate(path, { strokeDashoffset: 0 }, {
        duration: strokeWidth === 2 ? 0.4 : 0.3,
        ease: 'easeInOut',
      });
      // Start infinite pulse for HABIT→REWARD
      if (isPulse && active) {
        animate(pulseOpacity, 0.6, {
          duration: 1,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'reverse',
        });
      }
    }, delay);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [delay, strokeWidth, isPulse]); // eslint-disable-line react-hooks/exhaustive-deps

  const d = arcPath(fromKey, toKey, cpx, cpy);
  const markerId = `arrow-${id}`;

  return (
    <motion.path
      ref={pathRef}
      d={d}
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      markerEnd={`url(#${markerId})`}
      style={{ opacity: pulseOpacity }}
    />
  );
}

/* ArcLabel — fades in shortly after its arc draws */
function ArcLabel({ x, y, color, text, delay, drawDuration }) {
  const [scope, anim] = useAnimate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scope.current) anim(scope.current, { opacity: 1 }, { duration: 0.25 });
    }, delay + drawDuration * 1000 + 50);
    return () => clearTimeout(timer);
  }, [delay, drawDuration]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <text
      ref={scope}
      x={x}
      y={y}
      textAnchor="middle"
      fontSize="9"
      fontFamily="'Space Grotesk', sans-serif"
      fontWeight="400"
      fill={color}
      opacity="0"
    >
      {text}
    </text>
  );
}

/* AnimatedNode — fades + scales in; HABIT node gets spring pulse */
function AnimatedNode({ nodeKey, answer, delay, isHabit }) {
  const node = NODES[nodeKey];
  const [scope, anim] = useAnimate();

  // Truncate answer to fit node (max ~12 chars)
  const display = answer
    ? answer.length > 12 ? answer.slice(0, 11) + '\u2026' : answer
    : '';

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!scope.current) return;
      if (isHabit) {
        await anim(scope.current, { opacity: 1, scale: 1 }, { duration: 0.2, ease: 'easeOut' });
        // Spring pulse to draw attention to the HABIT node
        await anim(scope.current, { scale: 1.14 }, {
          type: 'spring', stiffness: 600, damping: 12,
        });
        await anim(scope.current, { scale: 1 }, {
          type: 'spring', stiffness: 280, damping: 22,
        });
      } else {
        await anim(scope.current, { opacity: 1, scale: 1 }, {
          duration: 0.4, ease: [0.22, 1, 0.36, 1],
        });
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, isHabit]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.g
      ref={scope}
      style={{
        opacity: 0,
        scale: 0.65,
        transformOrigin: `${node.cx}px ${node.cy}px`,
      }}
    >
      <circle
        cx={node.cx}
        cy={node.cy}
        r={NODE_R}
        fill="#FFFFFF"
        stroke="#161616"
        strokeWidth="2"
      />
      {/* Category label */}
      <text
        x={node.cx}
        y={node.cy - 5}
        textAnchor="middle"
        fontSize="9"
        fontFamily="'Space Grotesk', sans-serif"
        fontWeight="400"
        fill="#9B9B9B"
        aria-hidden="true"
      >
        {node.label}
      </text>
      {/* Answer label */}
      <text
        x={node.cx}
        y={node.cy + 10}
        textAnchor="middle"
        fontSize="10"
        fontFamily="'Space Grotesk', sans-serif"
        fontWeight="600"
        fill="#161616"
      >
        {display}
      </text>
    </motion.g>
  );
}

/* ----------------------------------------------------------------
   Main export
   ---------------------------------------------------------------- */
export default function LoopDiagram({ answers, onDiagramComplete }) {
  const ringRef = useRef(null);
  const [ringScope, animRing] = useAnimate();

  /* Cumulative delay schedule (ms):
     0    → ring starts (600ms)
     650  → CUE node (400ms)
     1100 → arc CUE→CRAVING (300ms)
     1450 → CRAVING node (400ms)
     1900 → arc CRAVING→HABIT (300ms)
     2250 → HABIT node (~500ms with spring)
     2800 → arc HABIT→REWARD (400ms)
     3250 → REWARD node (400ms)
     3700 → arc REWARD→CUE (400ms)
     4150 → diagram complete signal
  */
  const D = {
    ring:            0,
    cue:           650,
    arcCueCraving: 1100,
    craving:       1450,
    arcCravingHab: 1900,
    habit:         2250,
    arcHabReward:  2800,
    reward:        3250,
    arcRewardCue:  3700,
    complete:      4150,
  };

  // Step 1: outer ring
  useEffect(() => {
    if (!ringScope.current) return;
    const ring = ringScope.current;
    const circumference = 2 * Math.PI * 148;
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference;

    const t = setTimeout(() => {
      animRing(ring, { strokeDashoffset: 0 }, { duration: 0.6, ease: 'easeInOut' });
    }, D.ring);

    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Diagram complete callback → LoopScreen shows "Your Loop" + Loop Breaker
  useEffect(() => {
    const t = setTimeout(() => onDiagramComplete?.(), D.complete);
    return () => clearTimeout(t);
  }, [onDiagramComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <svg
      viewBox="0 0 320 320"
      width="100%"
      height="100%"
      role="img"
      aria-label="Animated habit loop diagram showing CUE, CRAVING, HABIT, and REWARD nodes"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <Marker id="arrow-cue-craving"  color="#161616" />
        <Marker id="arrow-craving-hab"  color="#161616" />
        <Marker id="arrow-hab-reward"   color="#E8192C" />
        <Marker id="arrow-reward-cue"   color="#F59E0B" />
      </defs>

      {/* Step 1: outer guide ring */}
      <circle
        ref={ringScope}
        cx="160" cy="160" r="148"
        fill="none"
        stroke="#9B9B9B"
        strokeWidth="1"
      />

      {/* Arcs — rendered before nodes so nodes sit on top */}

      {/* Step 3: CUE → CRAVING */}
      <AnimatedArc
        id="cue-craving"
        fromKey="CUE" toKey="CRAVING"
        cpx={268} cpy={52}
        color="#161616" strokeWidth={1}
        delay={D.arcCueCraving}
      />

      {/* Step 5: CRAVING → HABIT */}
      <AnimatedArc
        id="craving-hab"
        fromKey="CRAVING" toKey="HABIT"
        cpx={268} cpy={268}
        color="#161616" strokeWidth={1}
        delay={D.arcCravingHab}
      />

      {/* Step 7: HABIT → REWARD (red, thick, pulse) */}
      <AnimatedArc
        id="hab-reward"
        fromKey="HABIT" toKey="REWARD"
        cpx={160} cpy={320}
        color="#E8192C" strokeWidth={2}
        delay={D.arcHabReward}
        isPulse
      />

      {/* Step 9: REWARD → CUE (amber) */}
      <AnimatedArc
        id="reward-cue"
        fromKey="REWARD" toKey="CUE"
        cpx={52} cpy={52}
        color="#F59E0B" strokeWidth={1}
        delay={D.arcRewardCue}
      />

      {/* Arc labels */}
      <ArcLabel
        x={160} y={314}
        color="#E8192C" text="false reward"
        delay={D.arcHabReward} drawDuration={0.4}
      />
      <ArcLabel
        x={86} y={94}
        color="#F59E0B" text="sets up next trigger"
        delay={D.arcRewardCue} drawDuration={0.4}
      />

      {/* Nodes — on top of arcs */}

      {/* Step 2: CUE */}
      <AnimatedNode nodeKey="CUE"     answer={answers?.when}    delay={D.cue}    />
      {/* Step 4: CRAVING */}
      <AnimatedNode nodeKey="CRAVING" answer={answers?.trigger} delay={D.craving} />
      {/* Step 6: HABIT (spring pulse) */}
      <AnimatedNode nodeKey="HABIT"   answer={answers?.habit}   delay={D.habit}   isHabit />
      {/* Step 8: REWARD */}
      <AnimatedNode nodeKey="REWARD"  answer={answers?.feeling} delay={D.reward}  />
    </svg>
  );
}
