import { motion } from 'motion/react';
import { fadeUpTransition, fadeUpVariants } from '../motion/transitions';
import styles from './QuizResult.module.css';

export default function QuizResult({ totalQuestions, onRestart, onRetry }) {
  return (
    <motion.section
      className={styles.result}
      aria-labelledby="result-title"
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      transition={fadeUpTransition}
    >
      <div className={styles.branding}>
        <img src="/logo-lpee.png" alt="Logo LPEE" className={styles.logo} />
      </div>

      <h2 id="result-title" className={styles.title}>Terminé</h2>

      <p className={styles.resultScore}>
        <span className={styles.resultValue}>{totalQuestions}</span>
        <span className={styles.resultLabel}> cartes parcourues</span>
      </p>

      <p className={styles.message}>
        Bravo ! Vous avez révisé l&apos;ensemble des flashcards de la charte LPEE.
      </p>

      <div className={styles.actions}>
        <motion.button
          type="button"
          className={styles.primaryButton}
          onClick={onRetry}
          aria-label="Recommencer les flashcards"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
        >
          Recommencer
        </motion.button>
        <motion.button
          type="button"
          className={styles.secondaryButton}
          onClick={onRestart}
          aria-label="Retour au choix des sections"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
        >
          Retour aux sections
        </motion.button>
      </div>
    </motion.section>
  );
}
