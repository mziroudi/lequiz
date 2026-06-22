import styles from './ProgressBar.module.css';

export default function ProgressBar({ current, total }) {
  const value = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;

  return (
    <div
      className={styles.wrapper}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progression : question ${current + 1} sur ${total}`}
    >
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
