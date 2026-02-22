import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const posts = await query(
      `SELECT id, title, slug, content, excerpt, author, tags, views, published_at, created_at, metadata
       FROM blog_posts
       WHERE slug = $1 AND published = TRUE`,
      [slug]
    );

    if (posts.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = posts[0];

    // Parse metadata
    let metadata = {};
    try {
      metadata = typeof post.metadata === 'string' ? JSON.parse(post.metadata) : (post.metadata || {});
    } catch (e) {
      metadata = {};
    }

    // Parse tags
    let tags = [];
    try {
      tags = Array.isArray(post.tags) ? post.tags : (typeof post.tags === 'string' ? JSON.parse(post.tags) : []);
    } catch (e) {
      tags = [];
    }

    // Helper to extract image
    const extractImageUrlFromHtml = (html: string) => {
      const match = html.match(/<img[^>]+src="([^">]+)"/);
      return match ? match[1] : undefined;
    };

    const image_url = extractImageUrlFromHtml(post.content) || (metadata as any).image_url || '/blog-placeholder.jpg';

    return NextResponse.json({
      ...post,
      tags,
      metadata,
      image_url,
      excerpt: post.excerpt || (post.content ? post.content.substring(0, 200).replace(/<[^>]*>/g, '') + '...' : ''),
      category: tags[0] || 'General'
    });

  } catch (error: any) {
    console.error('Blog Post API error:', error);
    return NextResponse.json({
      error: 'Failed to fetch blog post',
      details: error.message
    }, { status: 500 });
  }
}
