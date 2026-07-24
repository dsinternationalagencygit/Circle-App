/**
 * StaticLoopDiagram
 * A non-animated, fully-rendered version of the loop diagram
 * used exclusively in the offscreen html2canvas capture zone.
 * Identical geometry to LoopDiagram but no Framer Motion — just
 * plain SVG with all elements fully visible.
 */

const NODE_R = 28;

const NODES = {
  CUE:     { cx: 160, cy:  52, label: 'CUE'     },
  CRAVING: { cx: 268, cy: 160, label: 'CRAVING'  },
  HABIT:   { cx: 160, cy: 268, label: 'HABIT'    },
  REWARD:  { cx:  52, cy: 160, label: 'REWARD'   },
};

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

function StaticNode({ nodeKey, answer }) {
  const node = NODES[nodeKey];
  const display = answer
    ? answer.length > 11 ? answer.slice(0, 10) + '\u2026' : answer
    : '';
  return (
    <g>
      <circle cx={node.cx} cy={node.cy} r={NODE_R} fill="#FFFFFF" stroke="#161616" strokeWidth="2" />
      <text x={node.cx} y={node.cy - 5} textAnchor="middle" fontSize="9"
        fontFamily="'Space Grotesk', sans-serif" fill="#9B9B9B">{node.label}</text>
      <text x={node.cx} y={node.cy + 10} textAnchor="middle" fontSize="10"
        fontFamily="'Space Grotesk', sans-serif" fontWeight="600" fill="#161616">{display}</text>
    </g>
  );
}

function Marker({ id, color }) {
  return (
    <marker id={id} markerWidth="7" markerHeight="7" refX="7" refY="3.5"
      orient="auto" markerUnits="userSpaceOnUse">
      <polygon points="0,0 7,3.5 0,7" fill={color} />
    </marker>
  );
}

export default function StaticLoopDiagram({ answers }) {
  const paths = {
    cc: qPath('CUE',     'CRAVING', 268,  52),
    ch: qPath('CRAVING', 'HABIT',   268, 268),
    hr: qPath('HABIT',   'REWARD',   52, 268),
    rc: qPath('REWARD',  'CUE',      52,  52),
  };

  return (
    <svg viewBox="0 0 320 320" width="100%" height="100%"
      xmlns="http://www.w3.org/2000/svg" role="img"
      aria-label="Habit loop diagram">
      <defs>
        <Marker id="s-cc" color="#161616" />
        <Marker id="s-ch" color="#161616" />
        <Marker id="s-hr" color="#E8192C" />
        <Marker id="s-rc" color="#F59E0B" />
      </defs>

      {/* Outer ring */}
      <circle cx="160" cy="160" r="148" fill="none" stroke="#9B9B9B" strokeWidth="1" />

      {/* Arcs */}
      <path d={paths.cc} stroke="#161616" strokeWidth="1" fill="none" markerEnd="url(#s-cc)" />
      <path d={paths.ch} stroke="#161616" strokeWidth="1" fill="none" markerEnd="url(#s-ch)" />
      <path d={paths.hr} stroke="#E8192C" strokeWidth="2" fill="none" markerEnd="url(#s-hr)" />
      <path d={paths.rc} stroke="#F59E0B" strokeWidth="1" fill="none" markerEnd="url(#s-rc)" />

      {/* Arc labels */}
      <text x="90" y="278" textAnchor="middle" fontSize="9"
        fontFamily="'Space Grotesk', sans-serif" fill="#E8192C">false reward</text>
      <text x="82" y="82" textAnchor="middle" fontSize="9"
        fontFamily="'Space Grotesk', sans-serif" fill="#F59E0B">sets up next trigger</text>

      {/* Nodes */}
      <StaticNode nodeKey="CUE"     answer={answers?.when}    />
      <StaticNode nodeKey="CRAVING" answer={answers?.trigger} />
      <StaticNode nodeKey="HABIT"   answer={answers?.habit}   />
      <StaticNode nodeKey="REWARD"  answer={answers?.feeling} />
    </svg>
  );
}
