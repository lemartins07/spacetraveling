/* eslint-disable react/no-danger */
import { useRouter } from 'next/router';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';

import Custom404 from '../404';
import Loader from '../../components/Loader';

import styles from './post.module.scss';
import { Comments } from '../../components/Comments/index';

interface Post {
  uid: string;
  id: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
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
  previousPost: {
    uid: string;
    data: {
      title: string;
    };
  };
  afterPost: {
    uid: string;
    data: {
      title: string;
    };
  };
  previewRef;
  preview: boolean;
}

export default function Post({
  post,
  previousPost,
  afterPost,
  previewRef,
  preview,
}: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <Loader />;
  }

  if (!post.uid) {
    return <Custom404 />;
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
            <div>
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
            {post.first_publication_date !== post.last_publication_date ? (
              <div className={styles.postEdited}>
                * editado em{' '}
                {format(
                  new Date(post.first_publication_date),
                  "dd MMM yyyy', às ' HH:mm",
                  {
                    locale: ptBR,
                  }
                )}
              </div>
            ) : (
              ''
            )}
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
        <div className={styles.postControlLinks}>
          <ul className={styles.linksTitle}>
            <li>{previousPost && <p>{previousPost.data.title}</p>}</li>
            <li>{afterPost && <p>{afterPost.data.title}</p>}</li>
          </ul>
          <ul className={styles.links}>
            <li>
              {previousPost && (
                <Link href={`/post/${previousPost.uid}`}>
                  <a>Post anterior</a>
                </Link>
              )}
            </li>
            <li>
              {afterPost && (
                <Link href={`/post/${afterPost.uid}`}>
                  <a>próximo Post</a>
                </Link>
              )}
            </li>
          </ul>
        </div>
        <Comments />
      </footer>
      {preview && (
        <div className={styles.preview}>
          <Link href="/api/exit-preview">
            <a>Sair do modo Preview</a>
          </Link>
        </div>
      )}
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

export const getStaticProps: GetStaticProps = async ({
  params,
  previewData,
  preview = false,
}) => {
  const prismic = getPrismicClient();

  const { slug } = params;
  const previewRef = previewData ? previewData.ref : null;
  const refOption = previewRef ? { ref: previewRef } : null;

  const response = await prismic.getByUID(
    'posts',
    String(slug),
    refOption || {}
  );

  const previousResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      orderings: '[document.first_publication_date desc]',
      after: response.id,
    }
  );

  const previousPost =
    previousResponse.results_size !== 0
      ? {
          uid: previousResponse?.results[0].uid,
          data: {
            title: previousResponse?.results[0].data.title,
          },
        }
      : null;

  const afterResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      orderings: '[document.first_publication_date]',
      after: response.id,
    }
  );

  const afterPost =
    afterResponse.results_size !== 0
      ? {
          uid: afterResponse?.results[0].uid,
          data: {
            title: afterResponse?.results[0].data.title,
          },
        }
      : null;

  const post = {
    uid: response.uid,
    id: response.id,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
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
      previousPost,
      afterPost,
      previewRef,
      preview,
    },
    revalidate: 1800,
  };
};
