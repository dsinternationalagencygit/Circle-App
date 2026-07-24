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
    10. HABIT→REWARD arc begins continuous opacity pulse (0.6↔1.0, 2s)
    11. "Your Loop" label fades in 300ms (500ms after diagram done)
   ---------------------------------------------------------------- */

// Node positions (centre coords in 320×320 viewBox)
const NODE_R = 28; // 56px diameter = 28px radius
const NODES = {
  CUE:     { cx: 160, cy: 52,  category: 'CUE',     answerKey: 'when'    },
  CRAVING: { cx: 268, cy: 160, category: 'CRAVING',  answerKey: 'trigger' },
  HABIT:   { cx: 160, cy: 268, category: 'HABIT',    answerKey: 'habit'   },
  REWARD:  { cx: 52,  cy: 160, category: 'REWARD',   answerKey: 'feeling' },
};

// Arc definitions: quadratic Bézier control points chosen to curve nicely
const ARCS = [
  {
    id: 'cue-craving',
    from: 'CUE', to: 'CRAVING',
    // control point slightly outside the circle boundary
    cpx: 268, cpy: 52,
    color: '#161616', strokeWidth: 1,
    label: null,
  },
  {
    id: 'craving-habit',
    from: 'CRAVING', to: 'HABIT',
    cpx: 268, cpy: 268,
    color: '#161616', strokeWidth: 1,
    label: null,
  },
  {
    id: 'habit-reward',
    from: 'HABIT', to: 'REWARD',
    cpx: 160, cpy: 330,  // curves below
    color: '#E8192C', strokeWidth: 2,
    label: 'false reward',
    isPulse: true,
  },
  {
    id: 'reward-cue',
    from: 'REWARD', to: 'CUE',
    cpx: 52, cpy: 52,
    color: '#F59E0B', strokeWidth: 1,
    label: 'sets up next trigger',
  },
];

// Helper: point on circle edge in the direction of a target point
function edgePoint(fromNode, toNode, offset = 0) {
  const dx = toNode.cx - fromNode.cx;
  const dy = toNode.cy - fromNode.cy;
  const len = Math.sqrt(dx * dx + dy * dy);
  const r = NODE_R + offset;
  return {
    x: fromNode.cx + (dx / len) * r,
    y: fromNode.cy + (dy / len) * r,
  };
}

// Build a quadratic bezier path string
function buildArcPath(arc) {
  const from = NODES[arc.from];
  const to   = NODES[arc.to];
  const cp   = { cx: arc.cpx, cpy: arc.cpy };

  // For the HABIT→REWARD arc that curves below, we use a different approach
  let startX, startY, endX, endY;

  if (arc.id === 'habit-reward') {
    // Curve below — control point is below both nodes
    startX = from.cx;
    startY = from.cy + NODE_R;
    endX   = to.cx;
    endY   = to.cy + NODE_R;
  } else if (arc.id === 'reward-cue') {
    // Curve left side
    startX = to.cx - NODE_R; // from REWARD going left then up
    startY = from.cy;
    endX   = to.cx - NODE_R;
    endY   = to.cy;

    // Better: edge from REWARD upward to CUE leftward
    const start = edgePoint(NODES.REWARD, { cx: 52, cy: 0 });
    const end   = edgePoint(NODES.CUE,   { cx: 0,  cy: 52 });
    startX = start.x; startY = start.y;
    endX   = end.x;   endY   = end.y;
  } else {
    const start = edgePoint(from, to);
    const end   = edgePoint(to, from);
    startX = start.x; startY = start.y;
    endX   = end.x;   endY   = end.y;
  }

  return `M ${startX} ${startY} Q ${arc.cpx} ${arc.cpy} ${endX} ${endY}`;
}

// Arrowhead marker component rendered in <defs>
function ArrowMarker({ id, color }) {
  return (
    <marker
      id={id}
      markerWidth="8"
      markerHeight="8"
      refX="6"
      refY="3"
      orient="auto"
    >
      <path d="M0,0 L0,6 L8,3 z" fill={color} />
    </marker>
  );
}

// Single animated arc path
function AnimatedArc({ arc, delay, onComplete }) {
  const [scope, animateArc] = useAnimate();
  const pulseOpacity = useMotionValue(1);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // Wait for the element to mount
      await new Promise((r) => setTimeout(r, delay));
      if (cancelled) return;

      // Measure the path length
      const path = scope.current;
      if (!path) return;
      const len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;

      // Draw animation
      await animateArc(path, { strokeDashoffset: 0 }, {
        duration: arc.strokeWidth === 2 ? 0.4 : 0.3,
        ease: 'easeInOut',
      });

      if (cancelled) return;

      // Start pulse if this is the HABIT→REWARD arc
      if (arc.isPulse) {
        animate(pulseOpacity, 0.6, {
          duration: 1,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'reverse',
        });
      }

      onComplete?.();
    }

    run();
    return () => { cancelled = true; };
  }, [delay]); // eslint-disable-line react-hooks/exhaustive-deps

  const markerId = `arrow-${arc.id}`;

  return (
    <motion.path
      ref={scope}
      d={buildArcPath(arc)}
      stroke={arc.color}
      strokeWidth={arc.strokeWidth}
      fill="none"
      markerEnd={`url(#${markerId})`}
      style={{ opacity: pulseOpacity }}
    />
  );
}

// Arc label that fades in with the arc
function ArcLabel({ arc, delay }) {
  const [scope, animateLabel] = useAnimate();

  useEffect(() => {
    async function run() {
      await new Promise((r) => setTimeout(r, delay + (arc.strokeWidth === 2 ? 400 : 300)));
      if (scope.current) {
        animateLabel(scope.current, { opacity: 1 }, { duration: 0.2 });
      }
    }
    run();
  }, [delay]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!arc.label) return null;

  // Position labels along arcs
  let x, y, textAnchor = 'middle';
  if (arc.id === 'habit-reward') {
    x = 160; y = 312;
  } else if (arc.id === 'reward-cue') {
    x = 88; y = 92;
  }

  return (
    <text
      ref={scope}
      x={x}
      y={y}
      textAnchor={textAnchor}
      fontSize="9"
      fontFamily="'Space Grotesk', sans-serif"
      fontWeight="400"
      fill={arc.color}
      opacity="0"
    >
      {arc.label}
    </text>
  );
}

// Single node (circle + labels)
function AnimatedNode({ node, answer, delay, isHabit, onComplete }) {
  const [scope, animateNode] = useAnimate();

  useEffect(() => {
    async function run() {
      await new Promise((r) => setTimeout(r, delay));
      if (!scope.current) return;

      if (isHabit) {
        // Spring pulse for HABIT node
        await animateNode(scope.current, { opacity: 1, scale: 1 }, { duration: 0.25 });
        await animateNode(scope.current, { scale: 1.12 }, {
          type: 'spring', stiffness: 600, damping: 15, duration: 0.15,
        });
        await animateNode(scope.current, { scale: 1 }, {
          type: 'spring', stiffness: 300, damping: 20, duration: 0.2,
        });
      } else {
        await animateNode(scope.current, { opacity: 1, scale: 1 }, {
          duration: 0.4, ease: 'easeOut',
        });
      }

      onComplete?.();
    }
    run();
  }, [delay]); // eslint-disable-line react-hooks/exhaustive-deps

  // Truncate long answers to fit node
  const displayAnswer = answer && answer.length > 12
    ? answer.slice(0, 11) + '…'
    : answer;

  return (
    <motion.g
      ref={scope}
      style={{ opacity: 0, scale: 0.7, transformOrigin: `${node.cx}px ${node.cy}px` }}
    >
      {/* Node circle */}
      <circle
        cx={node.cx}
        cy={node.cy}
        r={NODE_R}
        fill="#FFFFFF"
        stroke="#161616"
        strokeWidth="2"
      />
      {/* Category label (above answer) */}
      <text
        x={node.cx}
        y={node.cy - 6}
        textAnchor="middle"
        fontSize="9"
        fontFamily="'Space Grotesk', sans-serif"
        fontWeight="400"
        fill="#9B9B9B"
      >
        {node.category}
      </text>
      {/* Answer label */}
      <text
        x={node.cx}
        y={node.cy + 9}
        textAnchor="middle"
        fontSize="10"
        fontFamily="'Space Grotesk', sans-serif"
        fontWeight="600"
        fill="#161616"
      >
        {displayAnswer}
      </text>
    </motion.g>
  );
}

export default function LoopDiagram({ answers, onDiagramComplete }) {
  // Visibility flags for each element — driven by sequential animation timing
  // We use a ref-based approach: each element self-times via delay ms
  
  // Cumulative delays for each step:
  // 1. Outer ring: starts at 0, takes 600ms
  // 2. CUE node: 650ms start (600 + 50 gap)
  // 3. Arc CUE→CRAVING: 1100ms (650 + 400 + 50)
  // 4. CRAVING node: 1450ms (1100 + 300 + 50)
  // 5. Arc CRAVING→HABIT: 1900ms (1450 + 400 + 50)
  // 6. HABIT node: 2250ms
  // 7. Arc HABIT→REWARD: 2700ms (HABIT spring ~400ms)
  // 8. REWARD node: 3150ms
  // 9. Arc REWARD→CUE: 3600ms
  // Diagram complete: ~4050ms
  // 11. "Your Loop" label: 4550ms (500ms after complete)

  const DELAY = {
    ring: 0,
    cue: 650,
    arcCueCraving: 1100,
    craving: 1450,
    arcCravingHabit: 1900,
    habit: 2250,
    arcHabitReward: 2700,
    reward: 3150,
    arcRewardCue: 3600,
    complete: 4100,
  };

  // Outer ring animation
  const ringRef = useRef(null);
  const [ringScope, animateRing] = useAnimate();

  useEffect(() => {
    if (!ringScope.current) return;
    const ring = ringScope.current;
    const circumference = 2 * Math.PI * 148; // radius 148 of the outer guide ring
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference;

    const timer = setTimeout(async () => {
      await animateRing(ring, { strokeDashoffset: 0 }, { duration: 0.6, ease: 'easeInOut' });
    }, DELAY.ring);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // "Diagram complete" callback
  useEffect(() => {
    const timer = setTimeout(() => {
      onDiagramComplete?.();
    }, DELAY.complete);
    return () => clearTimeout(timer);
  }, [onDiagramComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <svg
      viewBox="0 0 320 320"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Habit loop diagram"
    >
      <defs>
        {ARCS.map((arc) => (
          <ArrowMarker key={arc.id} id={`arrow-${arc.id}`} color={arc.color} />
        ))}
      </defs>

      {/* Step 1: Outer ring guide */}
      <circle
        ref={ringScope}
        cx="160"
        cy="160"
        r="148"
        fill="none"
        stroke="#9B9B9B"
        strokeWidth="1"
      />

      {/* Step 3: Arc CUE → CRAVING */}
      <AnimatedArc arc={ARCS[0]} delay={DELAY.arcCueCraving} />
      {/* Step 5: Arc CRAVING → HABIT */}
      <AnimatedArc arc={ARCS[1]} delay={DELAY.arcCravingHabit} />
      {/* Step 7: Arc HABIT → REWARD (red pulse arc) */}
      <AnimatedArc arc={ARCS[2]} delay={DELAY.arcHabitReward} />
      {/* Step 9: Arc REWARD → CUE (amber) */}
      <AnimatedArc arc={ARCS[3]} delay={DELAY.arcRewardCue} />

      {/* Arc labels */}
      <ArcLabel arc={ARCS[2]} delay={DELAY.arcHabitReward} />
      <ArcLabel arc={ARCS[3]} delay={DELAY.arcRewardCue} />

      {/* Step 2: CUE node */}
      <AnimatedNode
        node={NODES.CUE}
        answer={answers?.when}
        delay={DELAY.cue}
      />
      {/* Step 4: CRAVING node */}
      <AnimatedNode
        node={NODES.CRAVING}
        answer={answers?.trigger}
        delay={DELAY.craving}
      />
      {/* Step 6: HABIT node (spring pulse) */}
      <AnimatedNode
        node={NODES.HABIT}
        answer={answers?.habit}
        delay={DELAY.habit}
        isHabit
      />
      {/* Step 8: REWARD node */}
      <AnimatedNode
        node={NODES.REWARD}
        answer={answers?.feeling}
        delay={DELAY.reward}
      />
    </svg>
  );
}
