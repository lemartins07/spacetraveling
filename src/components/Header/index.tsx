import styles from './header.module.scss';

export function Header(): JSX.Element {
  return (
    <header className={styles.content}>
      <img src="/images/logo.svg" alt="logo" />
      <h1>spacetraveling</h1>
    </header>
  );
}
