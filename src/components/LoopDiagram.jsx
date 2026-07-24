import { useEffect, useRef } from 'react';
import { motion, animate, useMotionValue } from 'framer-motion';

/* ================================================================
   LoopDiagram — Habit Loop animated SVG
   320×320 viewBox | diamond node layout

   NODE_R = 40 (80px diameter) — fits all answers without truncation
   All nodes on r=104 from centre (160,160):
     CUE     (top)    (160,  56)
     CRAVING (right)  (264, 160)
     HABIT   (bottom) (160, 264)
     REWARD  (left)   ( 56, 160)

   Arc control-points (corners of the diamond):
     CUE→CRAVING   CP (264,  56) top-right
     CRAVING→HABIT CP (264, 264) bottom-right
     HABIT→REWARD  CP ( 56, 264) bottom-left  ← RED pulse
     REWARD→CUE    CP ( 56,  56) top-left     ← AMBER
   ================================================================ */

const NODE_R = 40;

const NODES = {
  CUE:     { cx: 160, cy:  56, label: 'CUE'     },
  CRAVING: { cx: 264, cy: 160, label: 'CRAVING'  },
  HABIT:   { cx: 160, cy: 264, label: 'HABIT'    },
  REWARD:  { cx:  56, cy: 160, label: 'REWARD'   },
};

/** Split answer at first space for two-line layout inside node */
function splitAnswer(answer) {
  if (!answer) return { line1: '', line2: null };
  const spaceIdx = answer.indexOf(' ');
  if (spaceIdx === -1) return { line1: answer, line2: null };
  return {
    line1: answer.slice(0, spaceIdx),
    line2: answer.slice(spaceIdx + 1),
  };
}

/** Point on node perimeter in direction of (cpx, cpy) */
function edgeToward(node, cpx, cpy) {
  const dx = cpx - node.cx;
  const dy = cpy - node.cy;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return {
    x: +(node.cx + (dx / len) * (NODE_R + 3)).toFixed(2),
    y: +(node.cy + (dy / len) * (NODE_R + 3)).toFixed(2),
  };
}

function qPath(fromKey, toKey, cpx, cpy) {
  const s = edgeToward(NODES[fromKey], cpx, cpy);
  const e = edgeToward(NODES[toKey],   cpx, cpy);
  return `M ${s.x},${s.y} Q ${cpx},${cpy} ${e.x},${e.y}`;
}

/* ---- Subcomponents -------------------------------------------- */

function Marker({ id, color }) {
  return (
    <marker id={id} markerWidth="7" markerHeight="7"
      refX="7" refY="3.5" orient="auto" markerUnits="userSpaceOnUse">
      <polygon points="0,0 7,3.5 0,7" fill={color} />
    </marker>
  );
}

function Arc({ d, color, sw, markerId, delayS, dur }) {
  return (
    <motion.path d={d} stroke={color} strokeWidth={sw} fill="none"
      markerEnd={`url(#${markerId})`}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: delayS, duration: dur, ease: 'easeInOut' }}
    />
  );
}

function PulsingArc({ d, color, sw, markerId, delayS, dur }) {
  const opacity = useMotionValue(1);
  useEffect(() => {
    const t = setTimeout(() => {
      animate(opacity, [1, 0.55, 1], {
        duration: 2, ease: 'easeInOut', repeat: Infinity,
      });
    }, (delayS + dur) * 1000);
    return () => clearTimeout(t);
  }, [delayS, dur]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.path d={d} stroke={color} strokeWidth={sw} fill="none"
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
    <motion.text x={x} y={y} textAnchor="middle" fontSize="9"
      fontFamily="'Space Grotesk', sans-serif" fontWeight="400" fill={color}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ delay: delayS, duration: 0.3 }}>
      {text}
    </motion.text>
  );
}

/** Node with animated entrance and two-line text support */
function Node({ nodeKey, answer, delayS, isHabit }) {
  const node = NODES[nodeKey];
  const { line1, line2 } = splitAnswer(answer);

  return (
    <motion.g
      style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
      initial={{ opacity: 0, scale: 0.45 }}
      animate={isHabit
        ? { opacity: 1, scale: [0.45, 1.15, 0.93, 1] }
        : { opacity: 1, scale: 1 }}
      transition={isHabit
        ? { delay: delayS, duration: 0.55, ease: 'easeOut', times: [0, 0.45, 0.75, 1] }
        : { delay: delayS, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    >
      <circle cx={node.cx} cy={node.cy} r={NODE_R}
        fill="#FFFFFF" stroke="#161616" strokeWidth="2" />

      {line2 ? (
        /* Two-line layout */
        <>
          <text x={node.cx} y={node.cy - 16} textAnchor="middle"
            fontSize="8" fontFamily="'Space Grotesk', sans-serif"
            fontWeight="400" fill="#9B9B9B" aria-hidden="true">
            {node.label}
          </text>
          <text x={node.cx} y={node.cy - 2} textAnchor="middle"
            fontSize="11" fontFamily="'Space Grotesk', sans-serif"
            fontWeight="600" fill="#161616">
            {line1}
          </text>
          <text x={node.cx} y={node.cy + 13} textAnchor="middle"
            fontSize="11" fontFamily="'Space Grotesk', sans-serif"
            fontWeight="600" fill="#161616">
            {line2}
          </text>
        </>
      ) : (
        /* Single-line layout */
        <>
          <text x={node.cx} y={node.cy - 10} textAnchor="middle"
            fontSize="8" fontFamily="'Space Grotesk', sans-serif"
            fontWeight="400" fill="#9B9B9B" aria-hidden="true">
            {node.label}
          </text>
          <text x={node.cx} y={node.cy + 8} textAnchor="middle"
            fontSize="11" fontFamily="'Space Grotesk', sans-serif"
            fontWeight="600" fill="#161616">
            {line1}
          </text>
        </>
      )}
    </motion.g>
  );
}

/* ================================================================
   Main export
   ================================================================ */
export default function LoopDiagram({ answers, onDiagramComplete }) {
  /* Timing (seconds):
     0.00  outer ring         (0.60)
     0.65  CUE node           (0.38)
     1.10  arc CUE→CRAVING    (0.30)
     1.45  CRAVING node       (0.38)
     1.90  arc CRAVING→HABIT  (0.30)
     2.25  HABIT node spring  (0.55)
     2.85  arc HABIT→REWARD   (0.40)
     3.30  REWARD node        (0.38)
     3.75  arc REWARD→CUE     (0.40)
     4.20  diagram complete
  */
  useEffect(() => {
    const t = setTimeout(() => onDiagramComplete?.(), 4250);
    return () => clearTimeout(t);
  }, [onDiagramComplete]);

  const p = {
    cueCraving: qPath('CUE',     'CRAVING', 264,  56),
    cravingHab: qPath('CRAVING', 'HABIT',   264, 264),
    habReward:  qPath('HABIT',   'REWARD',   56, 264),
    rewardCue:  qPath('REWARD',  'CUE',      56,  56),
  };

  return (
    <svg viewBox="0 0 320 320" width="100%" height="100%"
      role="img" aria-label="Animated habit loop diagram"
      xmlns="http://www.w3.org/2000/svg">
      <defs>
        <Marker id="m-cc" color="#161616" />
        <Marker id="m-ch" color="#161616" />
        <Marker id="m-hr" color="#E8192C" />
        <Marker id="m-rc" color="#F59E0B" />
      </defs>

      {/* Outer guide ring */}
      <motion.circle cx="160" cy="160" r="148" fill="none"
        stroke="#9B9B9B" strokeWidth="1"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }} />

      {/* Arcs */}
      <Arc d={p.cueCraving} color="#161616" sw={1} markerId="m-cc" delayS={1.1}  dur={0.3} />
      <Arc d={p.cravingHab} color="#161616" sw={1} markerId="m-ch" delayS={1.9}  dur={0.3} />
      <PulsingArc d={p.habReward} color="#E8192C" sw={2} markerId="m-hr" delayS={2.85} dur={0.4} />
      <Arc d={p.rewardCue} color="#F59E0B" sw={1} markerId="m-rc" delayS={3.75} dur={0.4} />

      {/* Arc labels */}
      <ArcLabel x={90}  y={282} text="false reward"         color="#E8192C" delayS={3.3}  />
      <ArcLabel x={80}  y={78}  text="sets up next trigger" color="#F59E0B" delayS={4.2}  />

      {/* Nodes */}
      <Node nodeKey="CUE"     answer={answers?.when}    delayS={0.65} />
      <Node nodeKey="CRAVING" answer={answers?.trigger} delayS={1.45} />
      <Node nodeKey="HABIT"   answer={answers?.habit}   delayS={2.25} isHabit />
      <Node nodeKey="REWARD"  answer={answers?.feeling} delayS={3.30} />
    </svg>
  );
}
