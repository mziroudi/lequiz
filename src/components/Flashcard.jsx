import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { getSectionLabel } from '../data/sections';
import {
  easeSmooth,
  flipTransition,
  slideTransition,
  slideVariants,
} from '../motion/transitions';
import styles from './Flashcard.module.css';

function PrevIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 12a9 9 0 0 1 15.36-6.36M21 12a9 9 0 0 1-15.36 6.36"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 3v6h-6M3 21v-6h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Flashcard({
  card,
  cardNumber,
  totalCards,
  revealed,
  onReveal,
  onReset,
  onBackToSections,
  onPrev,
  onNext,
  isFirstCard,
  isLastCard,
}) {
  const [slideDirection, setSlideDirection] = useState('next');
  const isBlueCard = cardNumber % 2 === 1;
  const sectionLabel = getSectionLabel(card.section);

  function handlePrev() {
    setSlideDirection('prev');
    onPrev();
  }

  function handleNext() {
    setSlideDirection('next');
    onNext();
  }

  return (
    <section className={styles.flashcard} aria-label="Flashcard">
      <motion.button
        type="button"
        className={styles.backToSections}
        onClick={onBackToSections}
        aria-label="Retour au choix des sections"
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
      >
        <PrevIcon />
        Choisir une section
      </motion.button>

      <AnimatePresence mode="wait">
        <motion.div
          key={isBlueCard ? 'glow-blue' : 'glow-orange'}
          className={`${styles.glow} ${isBlueCard ? styles.glowBlue : styles.glowOrange}`}
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.5, ease: easeSmooth }}
        />
      </AnimatePresence>

      <AnimatePresence mode="wait" custom={slideDirection}>
        <motion.div
          key={cardNumber}
          className={styles.flipScene}
          custom={slideDirection}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={slideTransition}
        >
          <motion.div
            className={styles.flipInner}
            animate={{ rotateY: revealed ? 180 : 0 }}
            transition={flipTransition}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <article
              className={`${styles.cardFace} ${styles.cardFront} ${isBlueCard ? styles.blueCard : styles.orangeCard}`}
              aria-labelledby="card-question"
              onClick={onReveal}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onReveal();
                }
              }}
              role="button"
              tabIndex={0}
            >
              <header className={styles.cardHeader}>
                <span className={styles.sectionBadge}>{sectionLabel}</span>
                <span className={styles.counter}>
                  {cardNumber} / {totalCards}
                </span>
              </header>

              <h2 id="card-question" className={styles.questionText}>
                {card.question}
              </h2>

              <motion.button
                type="button"
                className={styles.revealButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onReveal();
                }}
                aria-label="Afficher la réponse"
                whileHover={{ scale: 1.03, color: '#ffffff' }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                Afficher la réponse
              </motion.button>
            </article>

            <article
              className={`${styles.cardFace} ${styles.cardBack} ${isBlueCard ? styles.backFromBlue : styles.backFromOrange}`}
              aria-labelledby="card-answer"
            >
              <header className={styles.cardHeaderBack}>
                <span className={styles.sectionBadgeBack}>{sectionLabel}</span>
                <span className={styles.counterBack}>
                  {cardNumber} / {totalCards}
                </span>
              </header>

              <motion.p
                id="card-answer"
                className={styles.answerText}
                initial={false}
                animate={{ opacity: revealed ? 1 : 0 }}
                transition={{ duration: 0.35, delay: revealed ? 0.25 : 0 }}
              >
                {card.correctAnswer}
              </motion.p>
            </article>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <nav className={styles.navBar} aria-label="Navigation des cartes">
        <motion.button
          type="button"
          className={styles.navCircle}
          onClick={handlePrev}
          disabled={isFirstCard}
          aria-label="Carte précédente"
          whileHover={!isFirstCard ? { scale: 1.06, backgroundColor: 'rgba(0, 95, 170, 0.06)' } : undefined}
          whileTap={!isFirstCard ? { scale: 0.95 } : undefined}
          transition={{ duration: 0.15 }}
        >
          <PrevIcon />
        </motion.button>

        <motion.button
          type="button"
          className={`${styles.navCircle} ${styles.navReset}`}
          onClick={onReset}
          disabled={!revealed}
          aria-label="Réinitialiser la carte"
          whileHover={revealed ? { scale: 1.06, backgroundColor: 'rgba(0, 95, 170, 0.06)' } : undefined}
          whileTap={revealed ? { scale: 0.95 } : undefined}
          transition={{ duration: 0.15 }}
        >
          <ResetIcon />
        </motion.button>

        <motion.button
          type="button"
          className={styles.navCircle}
          onClick={handleNext}
          aria-label={isLastCard ? 'Voir les résultats' : 'Carte suivante'}
          whileHover={{ scale: 1.06, backgroundColor: 'rgba(0, 95, 170, 0.06)' }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.15 }}
        >
          <NextIcon />
        </motion.button>
      </nav>
    </section>
  );
}
