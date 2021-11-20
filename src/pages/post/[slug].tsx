/* eslint-disable react/no-danger */
import { useRouter } from 'next/router';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';
import { Comments } from '../../components/Comments/index';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
      alt: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  let totalheadingWords = 0;
  let totalBodyWords = 0;
  const totalWords = post.data.content.map(content => {
    totalheadingWords += Number(content.heading.split(' ').length);
    totalBodyWords += Number(RichText.asText(content.body).split(' ').length);

    return totalheadingWords + totalBodyWords;
  });

  const timeReading = Math.ceil(totalWords[totalWords.length - 1] / 200);

  return (
    <>
      <Head>
        <title> {post.data.title} | spacetraveling</title>
      </Head>

      <main className={styles.container}>
        <img src={`${post.data.banner.url}`} alt={`${post.data.banner.alt}`} />
        <article className={styles.post}>
          <section className={styles.postHeader}>
            <h1>{post.data.title}</h1>
            <div className={styles.postContent}>
              <time>
                <FiCalendar />
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </time>
              <span>
                <FiUser />
                {post.data.author}
              </span>
              <span>
                <FiClock />
                {timeReading} min
              </span>
            </div>
          </section>
          {post.data.content.map(content => (
            <section key={content.heading} className={styles.postContent}>
              <h2>{content.heading}</h2>
              <div
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </section>
          ))}
        </article>
      </main>
      <footer className={styles.postFooter}>
        <ul className={styles.postControlLinks}>
          <li>
            <p>Titulo post anterior</p>
            <a>Post anterior</a>
          </li>
          <li>
            <p>Titulo próximo post</p>
            <a>Próximo post</a>
          </li>
        </ul>

        <Comments />
      </footer>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => ({
        heading: content.heading,
        body: [...content.body],
      })),
    },
  };

  return {
    props: {
      post,
    },
  };
};
