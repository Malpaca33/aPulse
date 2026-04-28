
  import { createBrowserSupabase } from '../lib/supabase.js';

  const supabase = createBrowserSupabase();
  const tweetForm = document.querySelector('#tweet-form');
  const tweetInput = document.querySelector('#tweet-input');
  const submitButton = document.querySelector('#submit-button');
  const refreshButton = document.querySelector('#refresh-button');
  const imageInput = document.querySelector('#image-input');
  const imagePreviewPanel = document.querySelector('#image-preview-panel');
  const imagePreview = document.querySelector('#image-preview');
  const removeImageButton = document.querySelector('#remove-image-button');
  const mediaPickerButton = document.querySelector('#media-picker-button');
  const googleLoginButton = document.querySelector('#google-login-button');
  const anonLoginButton = document.querySelector('#anon-login-button');
  const feedList = document.querySelector('#feed-list');
  const feedStatus = document.querySelector('#feed-status');
  const composerHint = document.querySelector('#composer-hint');
  const composerStatus = document.querySelector('#composer-status');
  const sessionLabel = document.querySelector('#session-label');
  const sessionIdentity = document.querySelector('#session-identity');
  const featuredList = document.querySelector('#featured-list');
  const statsPageViews = document.querySelector('#stat-page-views');
  const statsTopContributors = document.querySelector('#stat-top-contributors');
  const notifPanel = document.querySelector('#notif-panel');
  const notifList = document.querySelector('#notif-list');
  const notifBadge = document.querySelector('#notif-badge');
  const notifMarkRead = document.querySelector('#notif-mark-read');
  const notifNav = document.querySelector('#nav-notifications');
  const sessionAvatar = document.querySelector('#session-avatar');
  const sessionAvatarPlaceholder = document.querySelector('#session-avatar-placeholder');
  const composerAvatar = document.querySelector('#composer-avatar');
  const composerAvatarFallback = document.querySelector('#composer-avatar-fallback');
  const logoutButton = document.querySelector('#logout-button');
  const settingsButton = document.querySelector('#settings-button');
  const settingsModal = document.querySelector('#settings-modal');
  const settingsEmailInput = document.querySelector('#settings-email-input');
  const settingsPhoneInput = document.querySelector('#settings-phone-input');
  const settingsEmailToggle = document.querySelector('#settings-email-toggle');
  const settingsPhoneToggle = document.querySelector('#settings-phone-toggle');
  const settingsSaveBtn = document.querySelector('#settings-save-btn');
  const settingsStatus = document.querySelector('#settings-status');
  const ecgCanvas = document.querySelector('#ecg-canvas');
  const charCount = document.querySelector('#char-count');
  const charRingProgress = document.querySelector('#char-ring-progress');
  const charRingLabel = document.querySelector('#char-ring-label');
  const relativeTimeFormatter = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' });
  const MAX_TWEET_LENGTH = 280;
  const WARNING_TWEET_LENGTH = 260;
  const CHAR_RING_CIRCUMFERENCE = 97.39;

  let session = null;
  let refreshInFlight = false;
  let realtimeChannel = null;
  let authErrorMessage = '';
  let selectedImageFile = null;
  let selectedImagePreviewUrl = '';
  let currentView = 'timeline'; // 'timeline' | 'bookmarks' | 'search'

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function formatAuthor(userId) {
    if (!userId) {
      return 'Unknown';
    }

    if (session?.user?.id === userId) {
      return '你';
    }

    return `@${userId.slice(0, 8)}`;
  }

  function getDisplayName(session) {
    if (!session) return { label: '未登录', sub: '', avatar: '' };
    const meta = session.user?.user_metadata || {};
    const provider = session.user?.app_metadata?.provider;
    const shortId = session.user.id.slice(0, 8);
    if (provider === 'google') {
      const name = meta.full_name || meta.name || '';
      const prefix = name || (session.user.email || '').split('@')[0] || shortId;
      return { label: `🌟 ${prefix}`, sub: '正式成员', avatar: meta.avatar_url || meta.picture || '' };
    }
    return { label: `👣 游客模式`, sub: shortId, avatar: '' };
  }

  function updateSessionUI() {
    const info = getDisplayName(session);
    const isGoogle = session?.user?.app_metadata?.provider === 'google';
    sessionLabel.textContent = session ? info.label : '正在初始化...';
    sessionIdentity.textContent = session ? info.sub : '';

    // Avatar
    if (info.avatar) {
      sessionAvatar.src = info.avatar;
      sessionAvatar.classList.remove('hidden');
      sessionAvatarPlaceholder.classList.add('hidden');
      composerAvatar.src = info.avatar;
      composerAvatar.classList.remove('hidden');
      composerAvatarFallback.classList.add('hidden');
    } else {
      sessionAvatar.classList.add('hidden');
      sessionAvatarPlaceholder.classList.remove('hidden');
      sessionAvatarPlaceholder.textContent = info.label ? info.label.replace(/^..?\s*/, '').slice(0, 2).toUpperCase() : '?';
      composerAvatar.classList.add('hidden');
      composerAvatarFallback.classList.remove('hidden');
    }

    // Buttons
    if (session && isGoogle) {
      googleLoginButton.classList.add('hidden');
      anonLoginButton.classList.add('hidden');
      logoutButton.classList.remove('hidden');
      settingsButton.classList.remove('hidden');
    } else if (session) {
      googleLoginButton.classList.add('hidden');
      anonLoginButton.classList.add('hidden');
      logoutButton.classList.remove('hidden');
      settingsButton.classList.remove('hidden');
    } else {
      googleLoginButton.classList.remove('hidden');
      anonLoginButton.classList.remove('hidden');
      logoutButton.classList.add('hidden');
      settingsButton.classList.add('hidden');
    }
  }

  function formatRelativeTime(value) {
    const now = Date.now();
    const target = new Date(value).getTime();
    const diffSeconds = Math.round((target - now) / 1000);
    const ranges = [
      { unit: 'day', seconds: 86400 },
      { unit: 'hour', seconds: 3600 },
      { unit: 'minute', seconds: 60 },
      { unit: 'second', seconds: 1 },
    ];

    for (const range of ranges) {
      if (Math.abs(diffSeconds) >= range.seconds || range.unit === 'second') {
        return relativeTimeFormatter.format(Math.round(diffSeconds / range.seconds), range.unit);
      }
    }

    return '刚刚';
  }

  function sanitizeFileName(value) {
    return value.replace(/[^a-zA-Z0-9._-]/g, '-');
  }

  function clearImageSelection({ preserveStatus = false } = {}) {
    if (selectedImagePreviewUrl) {
      URL.revokeObjectURL(selectedImagePreviewUrl);
    }

    selectedImageFile = null;
    selectedImagePreviewUrl = '';
    imageInput.value = '';
    imagePreview.removeAttribute('src');
    imagePreviewPanel.classList.add('hidden');

    if (!preserveStatus) {
      updateComposerState();
    }
  }

  function toFriendlyErrorMessage(error) {
    const message = error?.message ?? '发生未知错误。';

    if (message === 'Anonymous sign-ins are disabled') {
      return 'Supabase 未启用匿名登录。请在 Authentication > Providers > Anonymous 中开启，或改用 GitHub 登录。';
    }

    if (message === 'Invalid path specified in request URL') {
      return 'PUBLIC_SUPABASE_URL 配置不正确，应为 https://<project-ref>.supabase.co';
    }

    if (message.includes('row-level security policy')) {
      return '远端 Supabase 的 tweets 插入策略仍在拒绝当前会话。请把仓库里的 supabase/schema.sql 重新执行到数据库后再试。';
    }

    return message;
  }

  function updateComposerState() {
    const rawLength = tweetInput.value.length;
    const trimmedLength = tweetInput.value.trim().length;
    const hasMedia = Boolean(selectedImageFile);
    const ready = Boolean(session) && (trimmedLength > 0 || hasMedia) && rawLength <= MAX_TWEET_LENGTH;
    const isNearLimit = rawLength > WARNING_TWEET_LENGTH && rawLength <= MAX_TWEET_LENGTH;
    const isOverLimit = rawLength > MAX_TWEET_LENGTH;
    const progress = Math.min(rawLength, MAX_TWEET_LENGTH) / MAX_TWEET_LENGTH;
    const strokeColor = isOverLimit ? '#fb7185' : isNearLimit ? '#fb923c' : '#38bdf8';
    const ringOffset = CHAR_RING_CIRCUMFERENCE * (1 - progress);

    charCount.textContent = `${rawLength} / ${MAX_TWEET_LENGTH}`;
    charCount.className = isOverLimit
      ? 'inline-flex rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300'
      : isNearLimit
        ? 'inline-flex rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-200'
        : 'inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-white/60';
    charRingProgress.style.stroke = strokeColor;
    charRingProgress.style.strokeDashoffset = `${ringOffset}`;
    charRingLabel.textContent = `${rawLength}`;
    charRingLabel.className = isOverLimit
      ? 'min-w-[2rem] text-right text-sm font-semibold text-rose-300'
      : isNearLimit
        ? 'min-w-[2rem] text-right text-sm font-semibold text-orange-200'
        : 'min-w-[2rem] text-right text-sm font-semibold text-white/70';
    submitButton.disabled = !ready;

    if (!session) {
      composerHint.textContent = authErrorMessage ? '当前未建立可用会话' : '正在建立匿名会话...';
      composerStatus.textContent = authErrorMessage || 'Supabase 会话准备好后即可发帖。';
      return;
    }

    authErrorMessage = '';
    composerHint.textContent = `当前身份 ${session.user.id.slice(0, 8)}`;

    if (!trimmedLength && !hasMedia) {
      composerStatus.textContent = '输入一些内容，然后直接发帖。';
      return;
    }

    if (isOverLimit) {
      composerStatus.textContent = `内容超出 ${rawLength - MAX_TWEET_LENGTH} 个字符，请精简后再发布。`;
      return;
    }

    if (hasMedia && !trimmedLength) {
      composerStatus.textContent = '图片已就绪，可以直接发布。';
      return;
    }

    if (hasMedia) {
      composerStatus.textContent = '文字与图片都已就绪。';
      return;
    }

    if (isNearLimit) {
      composerStatus.textContent = `还可输入 ${MAX_TWEET_LENGTH - rawLength} 个字符。`;
      return;
    }

    composerStatus.textContent = '内容已就绪。';
  }

  function highlightText(text, query) {
    if (!query || !text) return escapeHtml(text);
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return escapeHtml(text).replace(new RegExp(`(${escaped})`, 'gi'), '<mark class="bg-cyan-400/20 text-cyan-200 rounded-sm px-0.5">$1</mark>');
  }

  function renderTweets(tweets, likedIds = [], bookmarkedIds = [], starredIds = []) {
    if (!tweets.length) {
      const msg = currentView === 'bookmarks'
        ? '还没有收藏任何推文。'
        : currentView === 'search'
          ? '没有找到匹配的推文。'
          : '还没有推文，发出第一条吧。';
      feedList.innerHTML = `
        <article class="px-4 py-12 sm:px-6">
          <div class="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-10 text-center text-white/50">${msg}</div>
        </article>
      `;
      return;
    }

    const isSearch = currentView === 'search' && searchQuery;

    feedList.innerHTML = tweets
      .map((tweet) => {
        const author = formatAuthor(tweet.user_id);
        const badge = escapeHtml(author.replace('@', '').slice(0, 2).toUpperCase());
        const timestamp = new Date(tweet.created_at).toLocaleString('zh-CN', {
          hour12: false, month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
        });
        const isLiked = likedIds.includes(tweet.id);
        const isBookmarked = bookmarkedIds.includes(tweet.id);
        const isStarred = starredIds.includes(tweet.id);
        const isOwn = session?.user?.id === tweet.user_id;
        const comments = Array.isArray(tweet.recent_comments) ? tweet.recent_comments : [];
        const sourceType = tweet.source_type;
        const isCommentResult = isSearch && sourceType === 'comment';

        return `
          <article class="group px-4 py-4 transition hover:bg-white/[0.03] sm:px-6">
            ${isCommentResult ? `
            <a href="/tweet/${tweet.parent_tweet_id}" class="block">
              <div class="flex items-start gap-4">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm font-black text-white/80">${badge}</div>
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span class="text-sm font-semibold text-white">${escapeHtml(author)}</span>
                    <span class="text-sm text-white/25">·</span>
                    <span class="text-sm text-white/45">${escapeHtml(formatRelativeTime(tweet.created_at))}</span>
                    <span class="text-xs rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-cyan-300">回复</span>
                  </div>
                  <p class="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-white/85">${highlightText(tweet.content, searchQuery)}</p>
                  ${tweet.tweet_content ? `<p class="mt-2 text-xs text-white/30 italic">🔗 来自推文: ${escapeHtml(tweet.tweet_content.slice(0, 80))}${tweet.tweet_content.length > 80 ? '...' : ''}</p>` : ''}
                </div>
              </div>
            </a>
            ` : `
            <a href="/tweet/${tweet.id}" class="block">
              <div class="flex items-start gap-4">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm font-black text-white/80">${badge}</div>
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span class="text-sm font-semibold text-white">${escapeHtml(author)}</span>
                    <span class="text-sm text-white/25">·</span>
                    <span class="text-sm text-white/45">${escapeHtml(formatRelativeTime(tweet.created_at))}</span>
                    <span class="text-sm text-white/25">·</span>
                    <span class="text-sm text-white/35">${escapeHtml(timestamp)}</span>
                    ${tweet.is_featured ? '<span class="ml-1 text-sm">🌟</span>' : ''}
                    ${isSearch && sourceType === 'tweet' ? '<span class="text-xs rounded-full border border-white/10 px-2 py-0.5 text-white/50">原贴</span>' : ''}
                  </div>
                  ${tweet.content ? `<p class="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-white/85">${isSearch ? highlightText(tweet.content, searchQuery) : escapeHtml(tweet.content)}</p>` : ''}
                  ${tweet.image_url ? `<div class="mt-4 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03]"><img src="${escapeHtml(tweet.image_url)}" alt="tweet image" loading="lazy" class="max-h-[30rem] w-full object-cover" /></div>` : ''}
                </div>
              </div>
            </a>
            <div class="mt-3 flex items-center gap-6 pl-16">
              <button type="button" data-like-id="${tweet.id}" class="like-btn inline-flex items-center gap-1.5 text-sm transition ${isLiked ? 'text-rose-300' : 'text-white/45 hover:text-rose-300'}">
                <svg viewBox="0 0 24 24" class="h-[18px] w-[18px]" fill="${isLiked ? '#fb7185' : 'none'}" stroke="${isLiked ? '#fb7185' : 'currentColor'}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                <span>${tweet.likes_count ?? 0}</span>
              </button>
              <button type="button" data-star-id="${tweet.id}" class="star-btn inline-flex items-center gap-1.5 text-sm transition ${isStarred ? 'text-sky-300' : 'text-white/45 hover:text-sky-300'}">
                <svg viewBox="0 0 24 24" class="h-[18px] w-[18px]" fill="${isStarred ? '#38bdf8' : 'none'}" stroke="${isStarred ? '#38bdf8' : 'currentColor'}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                <span>精华</span>
              </button>
              <button type="button" data-bookmark-id="${tweet.id}" class="bookmark-btn inline-flex items-center gap-1.5 text-sm transition ${isBookmarked ? 'text-amber-300' : 'text-white/45 hover:text-amber-300'}">
                <svg viewBox="0 0 24 24" class="h-[18px] w-[18px]" fill="${isBookmarked ? '#f59e0b' : 'none'}" stroke="${isBookmarked ? '#f59e0b' : 'currentColor'}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
              </button>
              ${isOwn ? `<button type="button" data-delete-id="${tweet.id}" class="delete-btn ml-auto inline-flex items-center gap-1 text-sm text-white/25 transition hover:text-rose-400" title="删除推文"><svg viewBox="0 0 24 24" class="h-[16px] w-[16px]" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>` : ''}
            </div>
            ${!isCommentResult && comments.length > 0 ? `
            <div class="mt-3 pl-16 ml-6">
              ${comments.map(c => {
                const isCommentOwn = session?.user?.id === c.user_id;
                return `
                  <div class="border-l-2 border-white/10 py-2 pl-4 group/comment">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-semibold text-white/70">${escapeHtml(formatAuthor(c.user_id))}</span>
                      <span class="text-xs text-white/25">·</span>
                      <span class="text-xs text-white/40">${escapeHtml(formatRelativeTime(c.created_at))}</span>
                      ${isCommentOwn ? `<button type="button" data-comment-delete-id="${c.id}" class="ml-auto text-xs text-rose-400/60 opacity-0 transition hover:text-rose-300 group-hover/comment:opacity-100">删除</button>` : ''}
                    </div>
                    <p class="mt-0.5 whitespace-pre-wrap text-sm leading-6 text-white/60">${escapeHtml(c.content)}</p>
                  </div>
                `;
              }).join('')}
            </div>
            ` : !isCommentResult ? '<div class="mt-2 pl-16"><a href="/tweet/' + tweet.id + '" class="text-xs text-white/30 hover:text-white/50 transition">💬 回复</a></div>' : ''}
          </article>
        `;
      })
      .join('');
  }

  async function ensureSession() {
    const {
      data: { session: existingSession },
    } = await supabase.auth.getSession();

    if (existingSession) {
      session = existingSession;
      updateSessionUI();
      updateComposerState();
      return existingSession;
    }

    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      throw new Error(toFriendlyErrorMessage(error));
    }

    session = data.session ?? null;

    if (!session) {
      throw new Error('匿名会话创建失败。');
    }

    authErrorMessage = '';
    updateSessionUI();
    updateComposerState();
    return session;
  }

  async function fetchTweets({ silent = false } = {}) {
    if (refreshInFlight) return;
    refreshInFlight = true;

    if (!silent) feedStatus.textContent = currentView === 'bookmarks' ? '正在加载收藏...' : currentView === 'search' ? '搜索中...' : '正在同步最新推文...';

    try {
      let data;
      if (currentView === 'bookmarks' && session) {
        const { data: bmData, error: bErr } = await supabase
          .from('bookmarks')
          .select('*, tweets(*)')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
        if (bErr) throw new Error(toFriendlyErrorMessage(bErr));
        data = (bmData || []).map(b => ({ ...b.tweets, recent_comments: [] }));
      } else if (currentView === 'search' && searchQuery) {
        const { data: rpcData, error: sErr } = await supabase.rpc('search_all', { query_text: searchQuery, max_results: 20 });
        if (sErr) throw new Error(toFriendlyErrorMessage(sErr));
        data = rpcData ?? [];
      } else {
        const { data: rpcData, error: tErr } = await supabase.rpc('get_timeline', { max_results: 50 });
        if (tErr) throw new Error(toFriendlyErrorMessage(tErr));
        data = rpcData ?? [];
      }

      let likedIds = [], bookmarkedIds = [], starredIds = [];
      if (session) {
        const [likesRes, bookmarksRes, starsRes] = await Promise.all([
          supabase.from('tweet_likes').select('tweet_id').eq('user_id', session.user.id),
          supabase.from('bookmarks').select('tweet_id').eq('user_id', session.user.id),
          supabase.from('featured_stars').select('tweet_id').eq('user_id', session.user.id),
        ]);
        likedIds = (likesRes.data || []).map((l) => l.tweet_id);
        bookmarkedIds = (bookmarksRes.data || []).map((b) => b.tweet_id);
        starredIds = (starsRes.data || []).map((s) => s.tweet_id);
      }

      renderTweets(data, likedIds, bookmarkedIds, starredIds);
      feedStatus.textContent = `已更新 ${formatRelativeTime(new Date().toISOString())}`;
    } catch (error) {
      feedStatus.textContent = error.message;
    } finally {
      refreshInFlight = false;
    }
  }

  async function toggleLike(tweetId) {
    if (!session) return;
    const { data: existing } = await supabase
      .from('tweet_likes')
      .select('tweet_id')
      .eq('tweet_id', tweetId)
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (existing) {
      await supabase.from('tweet_likes').delete().eq('tweet_id', tweetId).eq('user_id', session.user.id);
    } else {
      await supabase.from('tweet_likes').insert({ tweet_id: tweetId, user_id: session.user.id });
    }

    await fetchTweets({ silent: true });
  }

  async function toggleBookmark(tweetId) {
    if (!session) return;
    const { data: existing } = await supabase
      .from('bookmarks')
      .select('tweet_id')
      .eq('tweet_id', tweetId)
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (existing) {
      await supabase.from('bookmarks').delete().eq('tweet_id', tweetId).eq('user_id', session.user.id);
    } else {
      await supabase.from('bookmarks').insert({ tweet_id: tweetId, user_id: session.user.id });
    }

    await fetchTweets({ silent: true });
  }

  async function toggleFeaturedStar(tweetId) {
    if (!session) return;
    const { data: existing } = await supabase
      .from('featured_stars')
      .select('tweet_id')
      .eq('tweet_id', tweetId)
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (existing) {
      await supabase.from('featured_stars').delete().eq('tweet_id', tweetId).eq('user_id', session.user.id);
    } else {
      await supabase.from('featured_stars').insert({ tweet_id: tweetId, user_id: session.user.id });
    }

    await fetchTweets({ silent: true });
  }

  async function deleteComment(commentId) {
    if (!session) return;
    const { error } = await supabase.from('comments').delete().eq('id', commentId).eq('user_id', session.user.id);
    if (error) { feedStatus.textContent = toFriendlyErrorMessage(error); return; }
    await fetchTweets({ silent: true });
  }

  async function deleteTweet(tweetId) {
    if (!session) return;
    if (!confirm('确认删除这条推文？')) return;
    const { error } = await supabase.from('tweets').delete().eq('id', tweetId).eq('user_id', session.user.id);
    if (error) { feedStatus.textContent = toFriendlyErrorMessage(error); return; }
    await fetchTweets({ silent: true });
  }

  function toggleBookmarkView() {
    if (currentView === 'bookmarks') {
      currentView = 'timeline';
    } else {
      currentView = 'bookmarks';
    }
    const feedTitle = document.querySelector('h1');
    if (feedTitle) feedTitle.textContent = currentView === 'bookmarks' ? '书签' : 'Home';
    fetchTweets();
  }

  let notifChannel = null;
  let notifOpen = false;

  function getNotifMessage(n) {
    const src = n.source_user_id ? `@${n.source_user_id.slice(0, 8)}` : '某人';
    switch (n.type) {
      case 'comment': return `${src} 评论了你的推文`;
      case 'like':    return `${src} 赞了你的推文`;
      case 'star':    return `${src} 标记了你的推文为精华`;
      default:        return `${src} 与你互动了`;
    }
  }

  function renderNotifications(list) {
    if (!list.length) {
      notifList.innerHTML = '<p class="py-4 text-center text-xs text-white/40">暂无通知。</p>';
      return;
    }
    notifList.innerHTML = list.map(n => `
      <div class="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm ${n.read ? 'opacity-50' : ''}">
        <div class="flex items-center gap-2">
          <span class="text-xs">${n.type === 'comment' ? '💬' : n.type === 'like' ? '❤️' : '⭐'}</span>
          <a href="/tweet/${n.tweet_id}" class="flex-1 text-white/80 transition hover:text-cyan-300">${escapeHtml(getNotifMessage(n))}</a>
          <span class="text-[10px] text-white/30">${escapeHtml(formatRelativeTime(n.created_at))}</span>
        </div>
      </div>
    `).join('');
  }

  async function loadNotifications() {
    if (!session) { notifList.innerHTML = '<p class="py-4 text-center text-xs text-white/40">登录后查看通知。</p>'; return; }
    const { data } = await supabase.from('notifications').select('*').eq('target_user_id', session.user.id).order('created_at', { ascending: false }).limit(20);
    renderNotifications(data ?? []);
  }

  async function updateNotifBadge() {
    if (!session) { notifBadge.classList.add('hidden'); return; }
    const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('target_user_id', session.user.id).eq('read', false);
    if (count > 0) {
      notifBadge.classList.remove('hidden');
      notifBadge.textContent = count > 99 ? '99+' : String(count);
    } else {
      notifBadge.classList.add('hidden');
    }
  }

  async function markAllNotifRead() {
    if (!session) return;
    await supabase.from('notifications').update({ read: true }).eq('target_user_id', session.user.id).eq('read', false);
    notifBadge.classList.add('hidden');
    if (notifOpen) loadNotifications();
  }

  function mountNotifRealtime() {
    notifChannel?.unsubscribe();
    if (!session) return;
    notifChannel = supabase
      .channel('notif-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `target_user_id=eq.${session.user.id}` }, () => {
        updateNotifBadge();
        if (notifOpen) loadNotifications();
      })
      .subscribe();
  }

  // 设置面板
  let settingsEmailOn = false;
  let settingsPhoneOn = false;

  function toggleSettingsSwitch(btn) {
    const isOn = btn.dataset.on === 'true';
    btn.dataset.on = isOn ? 'false' : 'true';
    const span = btn.querySelector('span');
    if (!isOn) {
      btn.classList.remove('bg-white/20');
      btn.classList.add('bg-cyan-500');
      span.classList.remove('translate-x-0.5');
      span.classList.add('translate-x-[1.125rem]');
    } else {
      btn.classList.add('bg-white/20');
      btn.classList.remove('bg-cyan-500');
      span.classList.add('translate-x-0.5');
      span.classList.remove('translate-x-[1.125rem]');
    }
    return !isOn;
  }

  async function loadSettings() {
    if (!session) return;
    const { data } = await supabase.from('user_configs').select('*').eq('user_id', session.user.id).single();
    if (data) {
      settingsEmailInput.value = data.notify_email || '';
      settingsPhoneInput.value = data.notify_phone || '';
      if (data.email_notifications) toggleSettingsSwitch(settingsEmailToggle);
      if (data.phone_notifications) toggleSettingsSwitch(settingsPhoneToggle);
    }
  }

  async function saveSettings() {
    if (!session) return;
    settingsStatus.textContent = '保存中...';
    const { error } = await supabase.from('user_configs').upsert({
      user_id: session.user.id,
      notify_email: settingsEmailInput.value.trim(),
      notify_phone: settingsPhoneInput.value.trim(),
      email_notifications: settingsEmailToggle.dataset.on === 'true',
      phone_notifications: settingsPhoneToggle.dataset.on === 'true',
    });
    if (error) { settingsStatus.textContent = error.message; return; }
    settingsStatus.textContent = '已保存 ✓';
    setTimeout(() => settingsModal.classList.add('hidden'), 1200);
  }

  // ECG 心电波形
  let ecgAnimId = null;
  let ecgData = [];
  let ecgOffset = 0;

  function drawEcg() {
    if (!ecgCanvas) return;
    const ctx = ecgCanvas.getContext('2d');
    const w = ecgCanvas.width;
    const h = ecgCanvas.height;
    ctx.clearRect(0, 0, w, h);

    const mid = h / 2;
    const amp = 22;

    // 网格
    ctx.strokeStyle = 'rgba(56,189,248,0.06)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    const points = [];
    const baseValue = ecgData.length > 0 ? ecgData[ecgData.length - 1].page_views : 100;

    for (let x = 0; x < w; x++) {
      const phase = (x + ecgOffset) * 0.08;
      let y = mid;
      y -= Math.sin(phase * 0.5) * 3 * Math.max(0, Math.sin(phase * 0.1));
      const qrs = Math.pow(Math.sin(phase * 0.3), 20) * amp * 0.7;
      y -= qrs;
      y -= Math.sin(phase * 0.15 + 2) * 4 * Math.max(0, Math.sin(phase * 0.08 + 0.5));
      y += (Math.random() - 0.5) * 1.5;
      y += Math.sin(phase * 0.02) * 3;

      const ampMod = 0.5 + (baseValue / 300);
      const finalY = mid + (y - mid) * ampMod;
      points.push({ x, y: Math.max(2, Math.min(h - 2, finalY)) });
    }

    // 光晕填充
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, 'rgba(56,189,248,0.15)');
    gradient.addColorStop(0.5, 'rgba(45,212,191,0.08)');
    gradient.addColorStop(1, 'rgba(56,189,248,0.15)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(points[0].x, h);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, h);
    ctx.closePath();
    ctx.fill();

    // 主波形
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(56,189,248,0.5)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    points.forEach((p, i) => { i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 外层发光
    ctx.strokeStyle = 'rgba(56,189,248,0.2)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    points.forEach((p, i) => { i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); });
    ctx.stroke();

    ecgOffset = (ecgOffset + 0.5) % w;
    ecgAnimId = requestAnimationFrame(drawEcg);
  }

  async function loadEcgData() {
    const { data } = await supabase.rpc('get_traffic_stats', { hours_range: 24 });
    ecgData = data ?? [];
    if (!ecgAnimId) drawEcg();
  }

  let searchQuery = '';
  let searchTimer = null;

  async function handleSearchInput() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      const q = document.querySelector('#search-input').value.trim();
      if (!q) {
        if (currentView === 'search') {
          currentView = 'timeline';
          document.querySelector('h1').textContent = 'Home';
          fetchTweets();
        }
        return;
      }
      searchQuery = q;
      currentView = 'search';
      document.querySelector('h1').textContent = `搜索: ${q}`;
      fetchTweets();
    }, 400);
  }

  async function loadFeaturedTweets() {
    const { data, error } = await supabase
      .from('tweets')
      .select('id, content, created_at')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error || !data?.length) {
      featuredList.innerHTML = '<p class="text-xs text-white/40">暂无精华帖。</p>';
      return;
    }

    featuredList.innerHTML = data
      .map(
        (t) =>
          `<a href="/tweet/${t.id}" class="block rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm transition hover:bg-white/[0.06]">${
            t.content
              ? `<p class="line-clamp-2 leading-6 text-white/70">${escapeHtml(t.content)}</p>`
              : '<p class="text-xs text-white/40 italic">[图片推文]</p>'
          }<p class="mt-1 text-[11px] text-white/30">${formatRelativeTime(t.created_at)}</p></a>`
      )
      .join('');
  }

  async function loadStats() {
    try {
      const { data: viewsData } = await supabase.rpc('increment_visit_count');
      if (viewsData != null) {
        statsPageViews.textContent = Number(viewsData).toLocaleString();
      }
    } catch { statsPageViews.textContent = '--'; }

    try {
      const { data: topUsers } = await supabase.rpc('get_top_posters', { limit_count: 3 });
      if (topUsers?.length) {
        statsTopContributors.innerHTML = topUsers
          .map(
            (u, i) =>
              `<div class="flex items-center justify-between text-xs">
                <span class="text-white/60">${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} @${u.user_id.slice(0, 8)}</span>
                <span class="text-white/40">${u.post_count} 条</span>
              </div>`
          )
          .join('');
      } else {
        statsTopContributors.innerHTML = '<p class="text-xs text-white/40">暂无数据。</p>';
      }
    } catch { statsTopContributors.innerHTML = '<p class="text-xs text-white/40">暂无数据。</p>'; }
  }

  // 个人资料
  const profileModal = document.querySelector('#profile-modal');
  const profileNickname = document.querySelector('#profile-nickname-input');
  const profileBio = document.querySelector('#profile-bio-input');
  const profileStatus = document.querySelector('#profile-status');

  async function loadProfile() {
    if (!session) return;
    const { data } = await supabase.from('profiles').select('nickname, bio').eq('id', session.user.id).single();
    if (data) {
      profileNickname.value = data.nickname || '';
      profileBio.value = data.bio || '';
    }
  }

  async function saveProfile() {
    if (!session) return;
    profileStatus.textContent = '保存中...';
    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      nickname: profileNickname.value.trim(),
      bio: profileBio.value.trim(),
    });
    if (error) { profileStatus.textContent = error.message; return; }
    profileStatus.textContent = '已保存 ✓';
    setTimeout(() => profileModal.classList.add('hidden'), 1200);
  }

  async function submitTweet(event) {
    event.preventDefault();

    const content = tweetInput.value.trim();

    if (!content && !selectedImageFile) {
      composerStatus.textContent = '先输入内容或选择图片再发帖。';
      return;
    }

    submitButton.disabled = true;
    composerStatus.textContent = selectedImageFile ? '正在上传图片并发帖...' : '正在发帖...';

    try {
      const currentSession = await ensureSession();

      if (!currentSession) {
        composerStatus.textContent = authErrorMessage || '请先完成登录。';
        return;
      }

      let imageUrl = null;
      let uploadedPath = null;

      if (selectedImageFile) {
        const fileName = sanitizeFileName(selectedImageFile.name || 'image');
        uploadedPath = `${currentSession.user.id}/${Date.now()}-${fileName}`;
        const { error: uploadError } = await supabase.storage.from('images').upload(uploadedPath, selectedImageFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: selectedImageFile.type || undefined,
        });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(uploadedPath);
        imageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from('tweets').insert({
        content,
        image_url: imageUrl,
      });

      if (error) {
        if (uploadedPath) {
          await supabase.storage.from('images').remove([uploadedPath]);
        }

        throw new Error(toFriendlyErrorMessage(error));
      }

      tweetInput.value = '';
      clearImageSelection({ preserveStatus: true });
      updateComposerState();
      composerStatus.textContent = '发帖成功。';
      await fetchTweets({ silent: true });
    } catch (error) {
      updateComposerState();
      composerStatus.textContent = toFriendlyErrorMessage(error);
    }
  }

  async function signInAnonymously() {
    try {
      composerStatus.textContent = '正在创建匿名会话...';
      await ensureSession();
      composerStatus.textContent = '匿名会话已就绪。';
    } catch (error) {
      authErrorMessage = toFriendlyErrorMessage(error);
      updateComposerState();
    }
  }

  async function signInWithGitHub() {
    try {
      const redirectTo = new URL(window.location.href);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: redirectTo.toString() },
      });

      if (error) { throw error; }
    } catch (error) {
      authErrorMessage = toFriendlyErrorMessage(error);
      updateComposerState();
    }
  }

  async function signInWithGoogle() {
    try {
      const redirectTo = new URL(window.location.href);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectTo.toString() },
      });

      if (error) { throw error; }
    } catch (error) {
      authErrorMessage = toFriendlyErrorMessage(error);
      updateComposerState();
    }
  }

  async function signInWithQQ() {
    try {
      const redirectTo = new URL(window.location.href);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'qq',
        options: { redirectTo: redirectTo.toString() },
      });

      if (error) { throw error; }
    } catch (error) {
      authErrorMessage = toFriendlyErrorMessage(error);
      updateComposerState();
    }
  }

  function mountRealtime() {
    realtimeChannel?.unsubscribe();
    realtimeChannel = supabase
      .channel('index-tweets-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tweets' }, () => {
        fetchTweets({ silent: true });
      })
      .subscribe();
  }

  tweetInput.addEventListener('input', updateComposerState);
  tweetForm.addEventListener('submit', submitTweet);
  refreshButton.addEventListener('click', () => fetchTweets());
  mediaPickerButton.addEventListener('click', () => imageInput.click());
  imageInput.addEventListener('change', () => {
    const nextImage = imageInput.files?.[0];

    if (!nextImage) {
      clearImageSelection();
      return;
    }

    if (!nextImage.type.startsWith('image/')) {
      composerStatus.textContent = '只能选择图片文件。';
      clearImageSelection({ preserveStatus: true });
      return;
    }

    clearImageSelection({ preserveStatus: true });
    selectedImageFile = nextImage;
    selectedImagePreviewUrl = URL.createObjectURL(nextImage);
    imagePreview.src = selectedImagePreviewUrl;
    imagePreviewPanel.classList.remove('hidden');
    updateComposerState();
  });
  removeImageButton.addEventListener('click', () => clearImageSelection());
  googleLoginButton.addEventListener('click', signInWithGoogle);
  anonLoginButton.addEventListener('click', signInAnonymously);
  logoutButton.addEventListener('click', async () => { await supabase.auth.signOut(); window.location.reload(); });
  settingsButton.addEventListener('click', () => { loadSettings(); settingsModal.classList.remove('hidden'); });
  document.querySelector('#settings-modal-close').addEventListener('click', () => settingsModal.classList.add('hidden'));
  settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) settingsModal.classList.add('hidden'); });
  settingsSaveBtn.addEventListener('click', saveSettings);
  settingsEmailToggle.addEventListener('click', function () { toggleSettingsSwitch(this); });
  settingsPhoneToggle.addEventListener('click', function () { toggleSettingsSwitch(this); });

  supabase.auth.onAuthStateChange((_event, nextSession) => {
    session = nextSession;
    authErrorMessage = '';
    updateSessionUI();
    updateComposerState();
  });

  // 事件委托：点赞 / 精华星 / 书签 / 删除
  feedList.addEventListener('click', (e) => {
    const likeBtn = e.target.closest('[data-like-id]');
    const starBtn = e.target.closest('[data-star-id]');
    const bookmarkBtn = e.target.closest('[data-bookmark-id]');
    const deleteBtn = e.target.closest('[data-delete-id]');
    const commentDeleteBtn = e.target.closest('[data-comment-delete-id]');
    if (likeBtn) { e.preventDefault(); toggleLike(likeBtn.dataset.likeId); }
    if (starBtn) { e.preventDefault(); toggleFeaturedStar(starBtn.dataset.starId); }
    if (bookmarkBtn) { e.preventDefault(); toggleBookmark(bookmarkBtn.dataset.bookmarkId); }
    if (deleteBtn) { e.preventDefault(); deleteTweet(deleteBtn.dataset.deleteId); }
    if (commentDeleteBtn) { e.preventDefault(); deleteComment(commentDeleteBtn.dataset.commentDeleteId); }
  });

  // 搜索事件
  const searchInput = document.querySelector('#search-input');
  if (searchInput) searchInput.addEventListener('input', handleSearchInput);

  // 书签导航
  document.querySelectorAll('nav a').forEach((a) => {
    if (a.textContent.trim() === '书签') {
      a.addEventListener('click', (e) => { e.preventDefault(); toggleBookmarkView(); });
    }
  });

  // 通知面板
  notifNav.addEventListener('click', (e) => {
    e.preventDefault();
    notifOpen = !notifOpen;
    notifPanel.classList.toggle('hidden', !notifOpen);
    if (notifOpen) loadNotifications();
  });
  notifMarkRead.addEventListener('click', markAllNotifRead);

  // 资料弹窗
  const editProfileBtn = document.querySelector('#edit-profile-button');
  const profileModalClose = document.querySelector('#profile-modal-close');
  const profileSaveBtn = document.querySelector('#profile-save-btn');
  editProfileBtn.addEventListener('click', () => { loadProfile(); profileModal.classList.remove('hidden'); });
  profileModalClose.addEventListener('click', () => profileModal.classList.add('hidden'));
  profileModal.addEventListener('click', (e) => { if (e.target === profileModal) profileModal.classList.add('hidden'); });
  profileSaveBtn.addEventListener('click', saveProfile);

  updateComposerState();

  try {
    await ensureSession();
  } catch (error) {
    authErrorMessage = toFriendlyErrorMessage(error);
    sessionLabel.textContent = '未建立会话';
    updateComposerState();
  }

  mountRealtime();
  mountNotifRealtime();
  await fetchTweets();
  loadFeaturedTweets();
  loadStats();
  updateNotifBadge();
  loadEcgData();
  if (session) loadSettings();
