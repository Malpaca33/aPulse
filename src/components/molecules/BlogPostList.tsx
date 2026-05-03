import { QueryProvider } from '../QueryProvider';
import { useBlogPosts } from '../../hooks/useBlogPosts';

function BlogPostListContent() {
  const { data: posts = [], isLoading, error } = useBlogPosts();

  if (isLoading) return null;
  if (error || posts.length === 0) return null;

  const published = posts.filter(p => p.published);
  if (published.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold text-primary mb-6">在线创作</h2>
      <div className="space-y-6">
        {published.map(post => (
          <article key={post.id} className="group">
            <a href={`/blog/${post.slug}`} className="block">
              <time className="text-xs text-secondary">
                {new Date(post.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
              <h3 className="text-base font-semibold mt-1 group-hover:text-cyan-400 transition-colors">
                {post.title}
              </h3>
              {post.description && (
                <p className="text-sm text-secondary mt-1 leading-relaxed">{post.description}</p>
              )}
              {post.tags.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {post.tags.map((tag: string) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-secondary">#{tag}</span>
                  ))}
                </div>
              )}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

export function BlogPostList() {
  return (
    <QueryProvider>
      <BlogPostListContent />
    </QueryProvider>
  );
}
