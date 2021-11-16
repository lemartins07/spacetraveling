import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home() {
  return (
    <>
      <Head>
        <title>Home | spacetravel</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          <Link href="#">
            <a>
              <strong>Titulo</strong>
              <p>Descrição</p>
              <div>
                <time>15 Mar 2021</time>
                <span>Leandro Martins</span>
              </div>
            </a>
          </Link>
        </div>
        <div className={styles.posts}>
          <Link href="#">
            <a>
              <strong>Titulo</strong>
              <p>Descrição</p>
              <div>
                <time>15 Mar 2021</time>
                <span>Leandro Martins</span>
              </div>
            </a>
          </Link>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post'),
  ]);
  console.log(postsResponse);
  const posts = postsResponse.results;

  return {
    props: {
      posts,
    },
  };
};
