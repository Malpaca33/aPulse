// 基于 Supabase 实际表结构的手写类型定义
// 如需自动生成：supabase gen types typescript --linked > src/lib/database.types.ts

export interface Tweet {
  id: string;
  content: string;
  image_url: string | null;
  city: string | null;
  topic: string | null;
  user_id: string;
  likes_count: number;
  comments_count: number;
  is_featured: boolean;
  created_at: string;
}

export interface TweetLike {
  id: string;
  tweet_id: string;
  user_id: string;
  created_at: string;
}

export interface Bookmark {
  id: string;
  tweet_id: string;
  user_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  tweet_id: string;
  content: string;
  user_id: string;
  created_at: string;
}

export interface Profile {
  id: string;
  nickname: string | null;
  bio: string | null;
  avatar_url: string | null;
  updated_at: string | null;
}

export interface Notification {
  id: string;
  type: 'comment' | 'like' | 'star';
  source_user_id: string;
  target_user_id: string;
  tweet_id: string | null;
  read: boolean;
  created_at: string;
}

export interface FeaturedStar {
  id: string;
  tweet_id: string;
  user_id: string;
  created_at: string;
}

// 带关联数据的推文（列表页用）
export interface TweetWithRelations extends Tweet {
  profiles: Pick<Profile, 'nickname'> | null;
  viewer_has_liked: boolean;
  viewer_has_bookmarked: boolean;
  recent_comments?: (Pick<Comment, 'id' | 'content' | 'created_at' | 'user_id'> & {
    profiles: Pick<Profile, 'nickname'> | null;
  })[];
}

// 聚合查询返回类型
export interface TimelineResult extends Tweet {
  recent_comments: (Pick<Comment, 'id' | 'content' | 'created_at' | 'user_id'>)[];
}
