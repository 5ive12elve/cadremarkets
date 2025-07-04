import { motion } from 'framer-motion'
import PropTypes from 'prop-types'

const MovingParticles = ({ count = 12 }) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary opacity-30"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.initialX}%`,
            top: `${particle.initialY}%`,
          }}
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -30, 30, 0],
            opacity: [0.3, 0.7, 0.2, 0.3],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "linear",
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  )
}

MovingParticles.propTypes = {
  count: PropTypes.number,
}

export default MovingParticles 