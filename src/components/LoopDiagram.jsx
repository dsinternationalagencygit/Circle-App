import { useEffect } from 'react';
import { motion, animate, useMotionValue } from 'framer-motion';

/* ================================================================
   LoopDiagram — Habit Loop animated SVG
   320×320 viewBox | diamond node layout (all on r=108 from centre)

   Node centres:
     CUE     (top)   (160, 52)
     CRAVING (right) (268,160)
     HABIT   (bottom)(160,268)
     REWARD  (left)  ( 52,160)

   Arc control-points (quadratic Bézier — corners of the diamond):
     CUE→CRAVING   CP (268,  52) top-right corner
     CRAVING→HABIT CP (268, 268) bottom-right corner
     HABIT→REWARD  CP ( 52, 268) bottom-left corner  ← RED pulse
     REWARD→CUE    CP ( 52,  52) top-left corner     ← AMBER

   Animation uses Framer Motion pathLength (0→1) for arcs,
   opacity+scale for nodes, and an infinite opacity oscillation
   (1↔0.55, 2 s) for the red arc after it finishes drawing.
   ================================================================ */

const NODE_R = 28; // 56 px diameter

const NODES = {
  CUE:     { cx: 160, cy:  52, label: 'CUE',     answerKey: 'when'    },
  CRAVING: { cx: 268, cy: 160, label: 'CRAVING',  answerKey: 'trigger' },
  HABIT:   { cx: 160, cy: 268, label: 'HABIT',    answerKey: 'habit'   },
  REWARD:  { cx:  52, cy: 160, label: 'REWARD',   answerKey: 'feeling' },
};

/** Point on node's perimeter in the direction of (cpx, cpy) */
function edgeToward(node, cpx, cpy) {
  const dx = cpx - node.cx;
  const dy = cpy - node.cy;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return {
    x: +(node.cx + (dx / len) * (NODE_R + 3)).toFixed(2),
    y: +(node.cy + (dy / len) * (NODE_R + 3)).toFixed(2),
  };
}

/** Quadratic Bézier: M edge_of_from Q cpx,cpy edge_of_to */
function qPath(fromKey, toKey, cpx, cpy) {
  const s = edgeToward(NODES[fromKey], cpx, cpy);
  const e = edgeToward(NODES[toKey],   cpx, cpy);
  return `M ${s.x},${s.y} Q ${cpx},${cpy} ${e.x},${e.y}`;
}

/* ---- Subcomponents -------------------------------------------- */

function Marker({ id, color }) {
  return (
    <marker
      id={id}
      markerWidth="7"
      markerHeight="7"
      refX="7"
      refY="3.5"
      orient="auto"
      markerUnits="userSpaceOnUse"
    >
      <polygon points="0,0 7,3.5 0,7" fill={color} />
    </marker>
  );
}

/** Normal arc — pathLength draw only */
function Arc({ d, color, sw, markerId, delayS, dur }) {
  return (
    <motion.path
      d={d}
      stroke={color}
      strokeWidth={sw}
      fill="none"
      markerEnd={`url(#${markerId})`}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: delayS, duration: dur, ease: 'easeInOut' }}
    />
  );
}

/** Red arc — draws then starts infinite opacity pulse */
function PulsingArc({ d, color, sw, markerId, delayS, dur }) {
  const opacity = useMotionValue(1);

  useEffect(() => {
    const t = setTimeout(() => {
      animate(opacity, [1, 0.55, 1], {
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity,
      });
    }, (delayS + dur) * 1000);
    return () => clearTimeout(t);
  }, [delayS, dur]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.path
      d={d}
      stroke={color}
      strokeWidth={sw}
      fill="none"
      markerEnd={`url(#${markerId})`}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: delayS, duration: dur, ease: 'easeInOut' }}
      style={{ opacity }}
    />
  );
}

function ArcLabel({ x, y, text, color, delayS }) {
  return (
    <motion.text
      x={x}
      y={y}
      textAnchor="middle"
      fontSize="9"
      fontFamily="'Space Grotesk', sans-serif"
      fontWeight="400"
      fill={color}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delayS, duration: 0.3 }}
    >
      {text}
    </motion.text>
  );
}

function Node({ nodeKey, answer, delayS, isHabit }) {
  const node = NODES[nodeKey];
  const display =
    answer
      ? answer.length > 11
        ? answer.slice(0, 10) + '\u2026'
        : answer
      : '';

  return (
    <motion.g
      style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
      initial={{ opacity: 0, scale: 0.45 }}
      animate={
        isHabit
          ? { opacity: 1, scale: [0.45, 1.15, 0.93, 1] }
          : { opacity: 1, scale: 1 }
      }
      transition={
        isHabit
          ? {
              delay: delayS,
              duration: 0.55,
              ease: 'easeOut',
              times: [0, 0.45, 0.75, 1],
            }
          : {
              delay: delayS,
              duration: 0.38,
              ease: [0.22, 1, 0.36, 1],
            }
      }
    >
      <circle
        cx={node.cx}
        cy={node.cy}
        r={NODE_R}
        fill="#FFFFFF"
        stroke="#161616"
        strokeWidth="2"
      />
      {/* Category label — muted, small */}
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
      {/* User's answer — ink, 600 weight */}
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

/* ================================================================
   Main export
   ================================================================ */
export default function LoopDiagram({ answers, onDiagramComplete }) {
  /* Timing schedule (seconds):
       0.00  outer ring starts drawing   (dur 0.60)
       0.65  CUE node                    (dur 0.38)
       1.10  arc CUE→CRAVING             (dur 0.30)
       1.45  CRAVING node                (dur 0.38)
       1.90  arc CRAVING→HABIT           (dur 0.30)
       2.25  HABIT node (spring)         (dur 0.55)
       2.85  arc HABIT→REWARD RED        (dur 0.40)
       3.30  REWARD node                 (dur 0.38)
       3.75  arc REWARD→CUE AMBER        (dur 0.40)
       4.20  diagram complete → callback
  */
  useEffect(() => {
    const t = setTimeout(() => onDiagramComplete?.(), 4200);
    return () => clearTimeout(t);
  }, [onDiagramComplete]);

  // Pre-compute all arc paths
  const p = {
    cueCraving: qPath('CUE',     'CRAVING', 268,  52),
    cravingHab: qPath('CRAVING', 'HABIT',   268, 268),
    habReward:  qPath('HABIT',   'REWARD',   52, 268),
    rewardCue:  qPath('REWARD',  'CUE',      52,  52),
  };

  return (
    <svg
      viewBox="0 0 320 320"
      width="100%"
      height="100%"
      role="img"
      aria-label="Animated habit loop diagram showing CUE, CRAVING, HABIT and REWARD"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <Marker id="m-cc"  color="#161616" />
        <Marker id="m-ch"  color="#161616" />
        <Marker id="m-hr"  color="#E8192C" />
        <Marker id="m-rc"  color="#F59E0B" />
      </defs>

      {/* ── Step 1: outer guide ring ─────────────────────────── */}
      <motion.circle
        cx="160"
        cy="160"
        r="148"
        fill="none"
        stroke="#9B9B9B"
        strokeWidth="1"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />

      {/* ── Arcs (behind nodes) ──────────────────────────────── */}

      {/* Step 3: CUE → CRAVING */}
      <Arc
        d={p.cueCraving}
        color="#161616" sw={1}
        markerId="m-cc"
        delayS={1.1} dur={0.3}
      />

      {/* Step 5: CRAVING → HABIT */}
      <Arc
        d={p.cravingHab}
        color="#161616" sw={1}
        markerId="m-ch"
        delayS={1.9} dur={0.3}
      />

      {/* Step 7: HABIT → REWARD (red, thicker, then pulses forever) */}
      <PulsingArc
        d={p.habReward}
        color="#E8192C" sw={2}
        markerId="m-hr"
        delayS={2.85} dur={0.4}
      />

      {/* Step 9: REWARD → CUE (amber) */}
      <Arc
        d={p.rewardCue}
        color="#F59E0B" sw={1}
        markerId="m-rc"
        delayS={3.75} dur={0.4}
      />

      {/* ── Arc labels ───────────────────────────────────────── */}
      {/* "false reward" near HABIT→REWARD arc midpoint (bottom-left) */}
      <ArcLabel
        x={90} y={278}
        text="false reward"
        color="#E8192C"
        delayS={3.3}
      />
      {/* "sets up next trigger" near REWARD→CUE arc midpoint (top-left) */}
      <ArcLabel
        x={82} y={82}
        text="sets up next trigger"
        color="#F59E0B"
        delayS={4.2}
      />

      {/* ── Nodes (in front of arcs) ─────────────────────────── */}

      {/* Step 2: CUE */}
      <Node nodeKey="CUE"     answer={answers?.when}    delayS={0.65} />
      {/* Step 4: CRAVING */}
      <Node nodeKey="CRAVING" answer={answers?.trigger} delayS={1.45} />
      {/* Step 6: HABIT — spring pulse */}
      <Node nodeKey="HABIT"   answer={answers?.habit}   delayS={2.25} isHabit />
      {/* Step 8: REWARD */}
      <Node nodeKey="REWARD"  answer={answers?.feeling} delayS={3.3}  />
    </svg>
  );
}
