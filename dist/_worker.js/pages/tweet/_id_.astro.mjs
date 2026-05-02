globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                      */
import { c as createComponent, r as renderComponent, a as renderTemplate } from '../../chunks/astro/server_BbF_25Bn.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_Dv9q_GNz.mjs';
import { j as jsxRuntimeExports } from '../../chunks/jsx-runtime_DoH26EBh.mjs';
import { a as reactExports } from '../../chunks/_@astro-renderers_C7YAWX8s.mjs';
export { r as renderers } from '../../chunks/_@astro-renderers_C7YAWX8s.mjs';
import { u as useQueryClient, Q as QueryProvider } from '../../chunks/QueryProvider_pVS1bIX3.mjs';
import { u as useStore, $ as $session } from '../../chunks/session_C5YHm6XM.mjs';
import { c as createBrowserSupabase } from '../../chunks/supabase_DL0FsLQC.mjs';
import { S as ShareModal } from '../../chunks/ShareModal_CWyRd4Qv.mjs';
import { u as useQuery } from '../../chunks/useQuery_D7ojLDCI.mjs';
import { u as useMutation } from '../../chunks/useMutation_DlgU-Kwl.mjs';

function formatAuthor$1(userId, currentUserId) {
  if (currentUserId === userId) return "你";
  return `@${userId.slice(0, 8)}`;
}
function formatRelativeTime$1(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const formatter = new Intl.RelativeTimeFormat("zh-CN", { numeric: "auto" });
  const secs = Math.round(diff / 1e3);
  if (secs < 60) return formatter.format(-secs, "second");
  if (secs < 3600) return formatter.format(-Math.round(secs / 60), "minute");
  if (secs < 86400) return formatter.format(-Math.round(secs / 3600), "hour");
  return formatter.format(-Math.round(secs / 86400), "day");
}
function TweetDetail({ tweet, onLike, onBookmark, onShare }) {
  const session = useStore($session);
  const [likeAnim, setLikeAnim] = reactExports.useState(false);
  const [bookmarkAnim, setBookmarkAnim] = reactExports.useState(false);
  const authorName = tweet.profiles?.nickname || formatAuthor$1(tweet.user_id, session?.id);
  const initials = authorName.slice(0, 2).toUpperCase() || "?";
  const handleLike = () => {
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 400);
    onLike();
  };
  const handleBookmark = () => {
    setBookmarkAnim(true);
    setTimeout(() => setBookmarkAnim(false), 400);
    onBookmark();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "border-b border-white/10 px-4 py-5 sm:px-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm font-black text-white/80", children: initials }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-x-2 gap-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-white", children: authorName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-white/25", children: "·" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-white/45", children: formatRelativeTime$1(tweet.created_at) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 whitespace-pre-wrap text-[15px] leading-7 text-white/85", children: tweet.content }),
        tweet.image_url && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: tweet.image_url, alt: "", loading: "lazy", className: "max-h-[30rem] w-full object-cover" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-6 border-t border-white/10 pt-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: handleLike,
          type: "button",
          className: `inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition hover:bg-rose-500/10 ${tweet.viewer_has_liked ? "text-rose-300" : "text-white/55 hover:text-rose-300"}`,
          "aria-label": "点赞",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "svg",
              {
                viewBox: "0 0 24 24",
                className: "h-5 w-5",
                fill: tweet.viewer_has_liked ? "#fb7185" : "none",
                stroke: tweet.viewer_has_liked ? "#fb7185" : "currentColor",
                strokeWidth: "1.8",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                style: likeAnim ? { animation: "like-bounce 0.4s ease-out" } : void 0,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: tweet.likes_count })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: handleBookmark,
          type: "button",
          className: `inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition hover:bg-amber-500/10 ${tweet.viewer_has_bookmarked ? "text-amber-300" : "text-white/55 hover:text-amber-300"}`,
          "aria-label": "书签",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "svg",
              {
                viewBox: "0 0 24 24",
                className: "h-5 w-5",
                fill: tweet.viewer_has_bookmarked ? "#f59e0b" : "none",
                stroke: tweet.viewer_has_bookmarked ? "#f59e0b" : "currentColor",
                strokeWidth: "1.8",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                style: bookmarkAnim ? { animation: "bookmark-pop 0.4s ease-out" } : void 0,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: tweet.viewer_has_bookmarked ? "已收藏" : "收藏" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: onShare,
          type: "button",
          className: "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-white/55 transition hover:bg-cyan-500/10 hover:text-cyan-300",
          "aria-label": "分享",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 24 24", className: "h-5 w-5", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "16 6 12 2 8 6" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", x2: "12", y1: "2", y2: "15" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "分享" })
          ]
        }
      )
    ] })
  ] });
}

const MAX_LENGTH = 500;
function formatAuthor(userId, currentUserId) {
  if (currentUserId === userId) return "你";
  return `@${userId.slice(0, 8)}`;
}
function formatRelativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const formatter = new Intl.RelativeTimeFormat("zh-CN", { numeric: "auto" });
  const secs = Math.round(diff / 1e3);
  if (secs < 60) return formatter.format(-secs, "second");
  if (secs < 3600) return formatter.format(-Math.round(secs / 60), "minute");
  if (secs < 86400) return formatter.format(-Math.round(secs / 3600), "hour");
  return formatter.format(-Math.round(secs / 86400), "day");
}
function CommentSection({ tweetId }) {
  const session = useStore($session);
  const [comments, setComments] = reactExports.useState([]);
  const [text, setText] = reactExports.useState("");
  const [status, setStatus] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const loadComments = reactExports.useCallback(async () => {
    const supabase = createBrowserSupabase();
    const { data, error } = await supabase.from("comments").select("id, content, user_id, created_at").eq("tweet_id", tweetId).order("created_at", { ascending: true });
    if (!error && data) setComments(data);
  }, [tweetId]);
  reactExports.useEffect(() => {
    loadComments();
    const supabase = createBrowserSupabase();
    const channel = supabase.channel(`comments-${tweetId}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "comments", filter: `tweet_id=eq.${tweetId}` },
      () => loadComments()
    ).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tweetId, loadComments]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setStatus("请输入评论内容。");
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      setStatus(`评论不能超过 ${MAX_LENGTH} 字。`);
      return;
    }
    if (!session) {
      setStatus("请先登录。");
      return;
    }
    setSubmitting(true);
    setStatus("发送中...");
    const supabase = createBrowserSupabase();
    const { error } = await supabase.from("comments").insert({
      tweet_id: tweetId,
      content: trimmed,
      user_id: session.id
    });
    if (error) {
      setStatus(error.message);
      setSubmitting(false);
      return;
    }
    setText("");
    setStatus("评论已发送。");
    setSubmitting(false);
    loadComments();
  };
  const handleDelete = async (commentId) => {
    if (!session) return;
    const supabase = createBrowserSupabase();
    const { error } = await supabase.from("comments").delete().eq("id", commentId).eq("user_id", session.id);
    if (error) {
      setStatus(error.message);
      return;
    }
    loadComments();
  };
  const charCount = text.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "border-t border-white/10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-white/10 px-4 py-4 sm:px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-base font-bold text-white", children: [
      "评论 ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-normal text-white/45", children: [
        "(",
        comments.length,
        ")"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-white/10 px-4 py-4 sm:px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-xs font-black uppercase text-white/60", children: session ? session.email?.slice(0, 2).toUpperCase() || "U" : "C" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: text,
            onChange: (e) => setText(e.target.value),
            rows: 2,
            placeholder: "写下你的评论...",
            className: "min-h-[3rem] w-full resize-none border-0 bg-transparent px-0 text-sm leading-6 text-white outline-none placeholder:text-white/30 focus:ring-0"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-between", children: [
          status && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/45", children: status }),
          !status && /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: charCount > MAX_LENGTH ? "text-xs text-rose-400" : "text-xs text-white/45", children: [
              charCount,
              " / ",
              MAX_LENGTH
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "submit",
                disabled: !text.trim() || charCount > MAX_LENGTH || submitting,
                className: "rounded-full bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35",
                children: submitting ? "发送中..." : "发送"
              }
            )
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-white/10", children: comments.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-10 text-center text-sm text-white/35", children: "还没有评论，来发表第一条吧。" }) : comments.map((c) => {
      const isOwn = session?.id === c.user_id;
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "group px-4 py-4 transition hover:bg-white/[0.02] sm:px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-[10px] font-black text-white/60", children: formatAuthor(c.user_id, session?.id).replace("@", "").slice(0, 2).toUpperCase() || "?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-white", children: formatAuthor(c.user_id, session?.id) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-white/25", children: "·" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-white/40", children: formatRelativeTime(c.created_at) }),
            isOwn && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => handleDelete(c.id),
                className: "ml-auto text-xs text-rose-400/60 opacity-0 transition hover:text-rose-300 group-hover:opacity-100",
                children: "删除"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 whitespace-pre-wrap text-sm leading-6 text-white/80", children: c.content })
        ] })
      ] }) }, c.id);
    }) })
  ] });
}

async function fetchTweet(id) {
  const supabase = createBrowserSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("tweets").select("id, content, image_url, city, topic, user_id, likes_count, created_at").eq("id", id).single();
  if (error || !data) throw new Error("推文不存在");
  const { data: profile } = await supabase.from("profiles").select("nickname").eq("id", data.user_id).single();
  let viewer_has_liked = false;
  let viewer_has_bookmarked = false;
  if (user) {
    const [likeRes, bookmarkRes] = await Promise.all([
      supabase.from("tweet_likes").select("id").eq("tweet_id", id).eq("user_id", user.id).maybeSingle(),
      supabase.from("bookmarks").select("id").eq("tweet_id", id).eq("user_id", user.id).maybeSingle()
    ]);
    viewer_has_liked = !!likeRes.data;
    viewer_has_bookmarked = !!bookmarkRes.data;
  }
  return {
    ...data,
    profiles: profile || { nickname: null },
    viewer_has_liked,
    viewer_has_bookmarked
  };
}
function useTweet(id) {
  return useQuery({
    queryKey: ["tweet", id],
    queryFn: () => fetchTweet(id),
    enabled: !!id
  });
}
function useToggleTweetLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tweetId, currentlyLiked }) => {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("请先登录");
      if (currentlyLiked) {
        await supabase.from("tweet_likes").delete().eq("tweet_id", tweetId).eq("user_id", user.id);
      } else {
        await supabase.from("tweet_likes").insert({ tweet_id: tweetId, user_id: user.id });
      }
    },
    onMutate: async ({ tweetId, currentlyLiked }) => {
      await queryClient.cancelQueries({ queryKey: ["tweet", tweetId] });
      const previous = queryClient.getQueryData(["tweet", tweetId]);
      queryClient.setQueryData(["tweet", tweetId], (old) => {
        if (!old) return old;
        return {
          ...old,
          viewer_has_liked: !currentlyLiked,
          likes_count: currentlyLiked ? Math.max(0, old.likes_count - 1) : old.likes_count + 1
        };
      });
      return { previous };
    },
    onError: (_err, { tweetId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tweet", tweetId], context.previous);
      }
    },
    onSettled: (_data, _err, { tweetId }) => {
      queryClient.invalidateQueries({ queryKey: ["tweets"] });
      queryClient.invalidateQueries({ queryKey: ["tweet", tweetId] });
    }
  });
}
function useToggleTweetBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tweetId, currentlyBookmarked }) => {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("请先登录");
      if (currentlyBookmarked) {
        await supabase.from("bookmarks").delete().eq("tweet_id", tweetId).eq("user_id", user.id);
      } else {
        await supabase.from("bookmarks").insert({ tweet_id: tweetId, user_id: user.id });
      }
    },
    onMutate: async ({ tweetId, currentlyBookmarked }) => {
      const previous = queryClient.getQueryData(["tweet", tweetId]);
      queryClient.setQueryData(["tweet", tweetId], (old) => {
        if (!old) return old;
        return { ...old, viewer_has_bookmarked: !currentlyBookmarked };
      });
      return { previous };
    },
    onError: (_err, { tweetId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tweet", tweetId], context.previous);
      }
    },
    onSettled: (_data, _err, { tweetId }) => {
      queryClient.invalidateQueries({ queryKey: ["tweets"] });
      queryClient.invalidateQueries({ queryKey: ["tweet", tweetId] });
    }
  });
}

function TweetDetailContent() {
  const [tweetId, setTweetId] = reactExports.useState(null);
  const [shareTweet, setShareTweet] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const id = window.location.pathname.split("/").pop();
    if (id) setTweetId(id);
  }, []);
  const { data: tweet, isLoading, error } = useTweet(tweetId || "");
  const toggleLike = useToggleTweetLike();
  const toggleBookmark = useToggleTweetBookmark();
  if (!tweetId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center py-24 text-sm text-white/45", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "mr-3 h-5 w-5 animate-spin text-cyan-400", viewBox: "0 0 24 24", fill: "none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", strokeDasharray: "31.4 31.4", strokeLinecap: "round" }) }),
      "加载中..."
    ] });
  }
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center py-24 text-sm text-white/45", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "mr-3 h-5 w-5 animate-spin text-cyan-400", viewBox: "0 0 24 24", fill: "none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", strokeDasharray: "31.4 31.4", strokeLinecap: "round" }) }),
      "加载中..."
    ] });
  }
  if (error || !tweet) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-16 text-center text-white/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg", children: "推文不存在或已被删除。" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/", className: "mt-4 inline-block rounded-full border border-white/10 px-5 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/[0.06]", children: "返回首页" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      TweetDetail,
      {
        tweet,
        onLike: () => toggleLike.mutate({ tweetId: tweet.id, currentlyLiked: tweet.viewer_has_liked }),
        onBookmark: () => toggleBookmark.mutate({ tweetId: tweet.id, currentlyBookmarked: tweet.viewer_has_bookmarked }),
        onShare: () => setShareTweet(tweet)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CommentSection, { tweetId }),
    shareTweet && /* @__PURE__ */ jsxRuntimeExports.jsx(ShareModal, { tweet: shareTweet, onClose: () => setShareTweet(null) })
  ] });
}
function TweetDetailPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto min-h-screen max-w-2xl border-x border-white/10 bg-black text-white", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-20 border-b border-white/10 bg-black/80 backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 px-4 py-3 sm:px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white",
          "aria-label": "返回首页",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 24 24", className: "h-4 w-4", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19 12H5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m12 19-7-7 7-7" })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold text-white", children: "推文详情" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TweetDetailContent, {})
  ] }) });
}

const prerender = false;
const $$id = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "aPulse | \u63A8\u6587\u8BE6\u60C5", "description": "\u67E5\u770B\u63A8\u6587\u8BE6\u60C5\u4E0E\u8BC4\u8BBA" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "TweetDetailPage", TweetDetailPage, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Malpaca/Desktop/blog_vibeCoding/src/components/TweetDetailPage", "client:component-export": "TweetDetailPage" })} ` })}`;
}, "C:/Users/Malpaca/Desktop/blog_vibeCoding/src/pages/tweet/[id].astro", void 0);

const $$file = "C:/Users/Malpaca/Desktop/blog_vibeCoding/src/pages/tweet/[id].astro";
const $$url = "/tweet/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
