import { motion } from 'framer-motion';

/**
 * LoopBreakerCard
 * Props:
 *   text       — string | null   (null = loading state)
 *   delayMs    — number          (ms to wait before sliding in, default 400)
 */
export default function LoopBreakerCard({ text, delayMs = 400 }) {
  return (
    <motion.div
      className="loop-breaker-card"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: delayMs / 1000,
        duration: 0.32,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <span className="lbc-label">Your Loop Breaker</span>
      {text ? (
        <p className="lbc-text">{text}</p>
      ) : (
        <p className="lbc-text lbc-loading">Reading your loop&hellip;</p>
      )}
    </motion.div>
  );
}
