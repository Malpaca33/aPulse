import { motion } from 'framer-motion';
import { TweetCard } from '../molecules/TweetCard';
import { Spinner } from '../atoms/Spinner';

interface TimelineTweet {
  id: string;
  content: string;
  image_url?: string | null;
  city?: string | null;
  topic?: string | null;
  user_id: string;
  created_at: string;
  user: {
    nickname?: string | null;
    avatar_url?: string | null;
  };
  likes_count: number;
  comments_count?: number;
  viewer_has_liked?: boolean;
  viewer_has_bookmarked?: boolean;
}

interface TimelineProps {
  tweets: TimelineTweet[];
  loading?: boolean;
  onLike?: (tweetId: string) => void;
  onBookmark?: (tweetId: string) => void;
  onShare?: (tweetId: string) => void;
  onDelete?: (tweetId: string) => void;
}

export function Timeline({ tweets, loading, onLike, onBookmark, onShare, onDelete }: TimelineProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (tweets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <p className="text-secondary text-sm">暂无内容</p>
        <p className="text-tertiary text-xs mt-1">还没有任何推文，来发布第一条吧</p>
      </div>
    );
  }

  return (
    <motion.div
      className="divide-y divide-border-subtle"
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.05 } },
      }}
    >
      {tweets.map((tweet) => (
        <motion.div
          key={tweet.id}
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <TweetCard
            key={tweet.id}
            id={tweet.id}
            content={tweet.content}
            imageUrl={tweet.image_url}
            city={tweet.city}
            topic={tweet.topic}
            userId={tweet.user_id}
            createdAt={tweet.created_at}
            user={{
              nickname: tweet.user?.nickname,
              avatarUrl: tweet.user?.avatar_url,
            }}
            likesCount={tweet.likes_count}
            commentsCount={tweet.comments_count}
            isLiked={tweet.viewer_has_liked}
            isBookmarked={tweet.viewer_has_bookmarked}
            onLike={() => onLike?.(tweet.id)}
            onBookmark={() => onBookmark?.(tweet.id)}
            onShare={() => onShare?.(tweet.id)}
            onDelete={() => onDelete?.(tweet.id)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
