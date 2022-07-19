import React, { useState, useEffect } from 'react';
import styles from '../styles/Timer.module.css'
import Button from '@mui/material/Button';

const Timer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [alignment, setAlignment] = React.useState('en');

  function toggle() {
    setIsActive(!isActive);
  }

  function reset() {
    setSeconds(0);
    setIsActive(false);
  }

  useEffect(() => {
    const language = window.localStorage.getItem("language");
    setAlignment(language)

    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  return (
    <div className={styles.app}>
      {(alignment == "en")
        ?
          <div>
            <div>
            <h1 className={styles.timeTitle}>Time Your Workout!</h1>
            </div>
            <div className={styles.time}>
                {seconds}s
            </div>
            <div className={styles.row}>
                <Button className={styles.sButton} onClick={toggle}>
                {isActive ? 'Pause' : 'Start'}
                </Button>
                <Button className={styles.rButton} onClick={reset}>
                Reset
                </Button>
            </div>
          </div>

        :
          <div>
            <div>
            <h1 className={styles.timeTitle}>Chronométrez Votre Entraînement !</h1>
            </div>
            <div className={styles.time}>
                {seconds}s
            </div>
            <div className={styles.row}>
                <Button className={styles.sButton} onClick={toggle}>
                {isActive ? 'Pause' : 'Commencer'}
                </Button>
                <Button className={styles.rButton} onClick={reset}>
                  Réinitialiser
                </Button>
            </div>
          </div>
      }
        
    </div>
  );
};

export default Timer;