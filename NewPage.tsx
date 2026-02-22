import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { config } from '@/lib/config';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  tags: string[];
  published_at: string;
  image_url: string;
  category: string;
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://piata-ai.ro'
      : 'http://localhost:3000';

    // CHANGED: Use the dynamic route instead of query param
    const encodedSlug = encodeURIComponent(slug);
    const res = await fetch(`${apiUrl}/api/blog/${encodedSlug}`, {
      next: { revalidate: 3600 }
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title} | Piața AI`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image_url],
      type: 'article',
      publishedTime: post.published_at,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image_url],
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0F172A] to-[#1e1b4b]">
        {/* Header */}
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Button asChild variant="ghost" className="mb-8 pl-0 hover:pl-2 transition-all hover:bg-transparent text-[#00f0ff] hover:text-[#ff00f0] bg-white/5 border border-white/10 hover:border-[#00f0ff]/30">
            <a href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Înapoi la Blog
            </a>
          </Button>

          {/* Title */}
          <article className="prose prose-invert lg:prose-xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-xs font-bold rounded-full">
                  {post.category}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#00f0ff] to-[#ff00f0]">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm">
                <span className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-[#00f0ff]" />
                  {new Date(post.published_at).toLocaleDateString('ro-RO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-[#ff00f0]" />
                  {post.author}
                </span>
                {post.tags && post.tags.length > 0 && (
                  <span className="flex items-center gap-2 flex-wrap">
                    {post.tags.map((tag: string, i: number) => (
                      <span key={i} className="flex items-center text-xs px-2 py-1 bg-white/5 rounded-md">
                        <Tag className="mr-1 h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            </div>

            {/* Featured Image */}
            {post.image_url && (
              <div className="rounded-2xl overflow-hidden mb-10 border border-[#00f0ff]/20 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full object-cover max-h-[500px]"
                />
              </div>
            )}

            {/* Content */}
            <div
              className="space-y-6 text-lg leading-relaxed text-gray-300"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
        </div>
      </div>
    </>
  );
}
