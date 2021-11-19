import Link from 'next/link';

import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.content}>
      <Link href="/">
        <a>
          <img src="/images/logo.svg" alt="logo" />
          <h1>
            spacetraveling <strong>.</strong>
          </h1>
        </a>
      </Link>
    </header>
  );
}
