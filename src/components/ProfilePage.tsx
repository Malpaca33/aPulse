import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import { Pencil } from 'lucide-react';
import { QueryProvider } from './QueryProvider';
import { FeedLayout } from './templates/FeedLayout';
import { Timeline } from './organisms/Timeline';
import { EditProfileModal } from './molecules/EditProfileModal';
import { $session, $sessionLoading, initSession, signInAnonymously, signInWithOAuth, signOut } from '../stores/session';
import { useTimeline } from '../hooks/useTimeline';
import { useToggleLike, useToggleBookmark, useDeleteTweet } from '../hooks/useMutations';
import { useProfile, useUpdateProfile, uploadAvatar } from '../hooks/useProfile';

function ProfileContent() {
  const session = useStore($session);
  const sessionLoading = useStore($sessionLoading);
  const { data, isLoading } = useTimeline();
  const toggleLike = useToggleLike();
  const toggleBookmark = useToggleBookmark();
  const deleteTweet = useDeleteTweet();
  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile(session?.id);
  const { updateProfile, saving } = useUpdateProfile();
  const [showEdit, setShowEdit] = useState(false);

  const user = session
    ? {
        nickname: profile?.nickname || session.user_metadata?.nickname || session.user_metadata?.name || session.user_metadata?.full_name || session.email || '用户',
        avatarUrl: profile?.avatarUrl || session.user_metadata?.avatar_url || null,
      }
    : null;

  // Filter to only this user's tweets
  const myTweets = (data?.pages.flatMap((p) => p) ?? [])
    .filter((t: any) => t.user_id === session?.id)
    .map((t: any) => ({
      ...t,
      user: {
        nickname: t.profiles?.nickname || null,
        avatarUrl: null,
      },
    }));

  const initials = (profile?.nickname || session?.email || 'U').slice(0, 2).toUpperCase();
  const tweetCount = myTweets.length;

  const [editError, setEditError] = useState<string | null>(null);

  const handleSaveProfile = useCallback(async (data: { nickname: string; bio: string; avatarFile?: File }) => {
    if (!session?.id) return;
    setEditError(null);
    try {
      let avatarUrl: string | null | undefined = undefined;
      if (data.avatarFile) {
        avatarUrl = await uploadAvatar(session.id, data.avatarFile);
      }
      await updateProfile(session.id, {
        nickname: data.nickname || null,
        bio: data.bio || null,
        avatarUrl: avatarUrl ?? null,
      });
      refetchProfile();
    } catch (e: any) {
      setEditError(e?.message || '保存失败，请重试');
    }
  }, [session?.id, updateProfile, refetchProfile]);

  return (
    <FeedLayout
      user={user}
      currentPath="/profile"
      onLogin={(p) => signInWithOAuth(p)}
      onAnonymousLogin={signInAnonymously}
      onLogout={signOut}
      sessionLoading={sessionLoading}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 glass-header border-b border-glass-border">
        <div className="px-4 h-12 flex items-center">
          <h1 className="text-lg font-bold text-primary">个人主页</h1>
        </div>
      </div>

      {/* Profile card */}
      <div className="border-b border-border-subtle px-4 py-6">
        {session ? (
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="h-16 w-16 rounded-full border-2 border-cyan-400/30 bg-white/[0.05] flex items-center justify-center text-lg font-black text-white/80 overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1 pt-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-primary truncate">{user?.nickname || '用户'}</h2>
                <button
                  onClick={() => setShowEdit(true)}
                  className="h-7 w-7 rounded-full flex items-center justify-center text-secondary hover:text-white hover:bg-white/10 transition-colors shrink-0"
                  title="编辑资料"
                >
                  <Pencil size={14} />
                </button>
              </div>
              <p className="text-sm text-tertiary mt-0.5">{session.email}</p>
              {profile?.bio && (
                <p className="text-sm text-secondary mt-2">{profile.bio}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="text-secondary">
                  <strong className="text-primary">{tweetCount}</strong> 条推文
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-secondary text-sm mb-3">登录后查看个人主页</p>
          </div>
        )}
      </div>

      {/* User's tweets */}
      {session ? (
        <Timeline
          tweets={myTweets}
          loading={isLoading || sessionLoading}
          onLike={(id) => toggleLike.mutate(id)}
          onBookmark={(id) => toggleBookmark.mutate(id)}
          onDelete={(id) => deleteTweet.mutate(id)}
        />
      ) : (
        <div className="flex items-center justify-center py-20 text-sm text-tertiary">
          请先登录
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEdit && (
        <EditProfileModal
          nickname={profile?.nickname || ''}
          bio={profile?.bio || ''}
          avatarUrl={user?.avatarUrl || null}
          saving={saving}
          error={editError}
          onSave={handleSaveProfile}
          onClose={() => { setShowEdit(false); setEditError(null); }}
        />
      )}
    </FeedLayout>
  );
}

export function ProfilePage() {
  useEffect(() => {
    initSession();
  }, []);

  return (
    <QueryProvider>
      <ProfileContent />
    </QueryProvider>
  );
}
