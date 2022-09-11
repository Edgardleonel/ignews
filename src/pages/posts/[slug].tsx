import { GetServerSideProps } from "next"
import { getSession, useSession } from "next-auth/react"
import Head from "next/head";
import { useRouter } from "next/router";
import { RichText } from "prismic-dom";
import { useEffect } from "react";
import { getPrismicClient } from "../../services/prismic";

import styles from './post.module.scss';

interface PostProps {
    post: {
        slug: string;
        title: string;
        excerpt: string;
        content: string;
        updatedAt: string;
    }
}

export default function Post({ post }: PostProps) {
    const { data } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!data?.activeSubscription)
            router.push(`/posts/preview/${post.slug}`)

    }, [data])
    
    return (
        <>
            <Head>
                <title>{post.title} | Ignews</title>
            </Head>

            <main className={styles.container}>
                <article className={styles.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updatedAt}</time>
                    <div
                        className={styles.postContent}
                        dangerouslySetInnerHTML={{ __html: post.content }} />
                </article>
            </main>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
    const session = await getSession({ req });
    const { slug } = params;

    if (session?.userActiveSubscription === null) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }

    const prismic = getPrismicClient(req);
    const response: any = await prismic.getByUID('publication', String(slug), {});

    const post = {
        slug: response.uid,
        title: response.data?.title,
        content: RichText.asHtml(response.data.content),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    return {
        props: { post }
    }
}