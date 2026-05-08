"use client";

import { useRef, useState } from "react";
import { toBlob, toPng } from "html-to-image";

type FieldKey =
  | "furniture"
  | "roomVibe"
  | "outfit"
  | "companion"
  | "music"
  | "message";

type TagColor = "pink" | "mint" | "lavender" | "yellow" | "sky";

type Field = {
  key: FieldKey;
  label: string;
  placeholder: string;
  suggestions: string[];
  multiline?: boolean;
  color: TagColor;
  emoji: string;
  template: (value: string) => React.ReactNode;
};

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

function Blank({ value, placeholder }: { value: string; placeholder: string }) {
  const display = value.trim() === "" ? placeholder : value;
  const isEmpty = value.trim() === "";
  return (
    <span
      className={`wavy-underline mx-1 inline-block min-w-[3em] px-1 pb-1 text-center ${
        isEmpty ? "text-pink-300/70" : "text-pink-700"
      }`}
      style={{ fontFamily: "var(--font-handwriting)" }}
    >
      {display}
    </span>
  );
}

const FIELDS: Field[] = [
  {
    key: "furniture",
    label: "好きな家具",
    placeholder: "おきにいり",
    color: "pink",
    emoji: "🛋",
    suggestions: [
      "ふわふわソファ",
      "天蓋ベッド",
      "ローテーブル",
      "丸いラグ",
      "猫のクッション",
      "おおきな本棚",
    ],
    template: (v) => (
      <p>
        好きな家具は<Blank value={v} placeholder="おきにいり" />
        だよ❤︎
      </p>
    ),
  },
  {
    key: "roomVibe",
    label: "お部屋の雰囲気",
    placeholder: "どんなおへや？",
    color: "mint",
    emoji: "🏠",
    suggestions: [
      "ピンクで甘め",
      "森の中みたいな緑いっぱい",
      "白基調でシンプル",
      "夜空のような落ち着いた",
      "カフェみたいな",
      "ぬいぐるみだらけ",
    ],
    template: (v) => (
      <p>
        よく<Blank value={v} placeholder="どんなおへや？" />
        なお部屋に いることが 多いかな？♪
      </p>
    ),
  },
  {
    key: "outfit",
    label: "お気に入りコーデ",
    placeholder: "おきにのおふく",
    color: "lavender",
    emoji: "👗",
    suggestions: [
      "ピンクのワンピ",
      "ふんわりパジャマ",
      "セーラー服",
      "うさみみパーカー",
      "黒のゴスロリ",
      "ゆるTシャツ",
    ],
    template: (v) => (
      <p>
        <Blank value={v} placeholder="おきにのおふく" />
        を着て お部屋に行くよ！❤︎
      </p>
    ),
  },
  {
    key: "companion",
    label: "作業のお供",
    placeholder: "おとも",
    color: "yellow",
    emoji: "🍪",
    suggestions: [
      "あったかいカフェラテ",
      "クッキー",
      "いちごミルク",
      "おにぎり",
      "推しのグッズ",
      "ぬいぐるみ",
    ],
    template: (v) => (
      <p>
        作業のお供は<Blank value={v} placeholder="おとも" />♪
      </p>
    ),
  },
  {
    key: "music",
    label: "聴いてる音楽",
    placeholder: "BGM",
    color: "sky",
    emoji: "🎧",
    suggestions: [
      "lo-fi ビート",
      "雨の音",
      "カフェ風ジャズ",
      "ピアノBGM",
      "焚き火の音",
      "キーボードのASMR",
    ],
    template: (v) => (
      <p>
        聴いてる音楽は<Blank value={v} placeholder="BGM" />
        かな♬
      </p>
    ),
  },
  {
    key: "message",
    label: "ひとこと",
    placeholder: "ご自由にどうぞ",
    color: "pink",
    emoji: "💌",
    multiline: true,
    suggestions: [
      "今日もおつかれさま♡",
      "がんばってる人だいすき",
      "一緒に集中しよっ！",
      "また遊びにきてね",
    ],
    template: (v) => (
      <p>
        <Blank value={v} placeholder="ご自由にどうぞ" />
      </p>
    ),
  },
];

const initialValues: Record<FieldKey, string> = {
  furniture: "",
  roomVibe: "",
  outfit: "",
  companion: "",
  music: "",
  message: "",
};

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function Page() {
  const [name, setName] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [values, setValues] = useState<Record<FieldKey, string>>(initialValues);
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (key: FieldKey, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleAvatarChange = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("画像ファイルを選んでね💦");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      alert("画像は 5MB 以下にしてね💦");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    const node = previewRef.current;
    if (!node) return;
    setExporting(true);
    try {
      // Wait for web fonts to be ready so they render in the PNG.
      if (typeof document !== "undefined" && document.fonts?.ready) {
        await document.fonts.ready;
      }
      const baseOptions = {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#ffeef5",
      };
      let dataUrl: string;
      try {
        dataUrl = await toPng(node, baseOptions);
      } catch (e) {
        // Fallback: cross-origin stylesheets (e.g. Google Fonts loaded
        // without CORS) can throw SecurityError when html-to-image tries to
        // read cssRules. Retry without font embedding so the export still
        // succeeds (text falls back to system fonts in the PNG).
        console.warn(
          "[gogh] font-embedded export failed, retrying with skipFonts:",
          e
        );
        dataUrl = await toPng(node, { ...baseOptions, skipFonts: true });
      }
      const link = document.createElement("a");
      const safeName =
        (name || "gogh_profile").replace(/[^\p{L}\p{N}_-]/gu, "_") ||
        "gogh_profile";
      link.download = `${safeName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert("画像の保存に失敗しちゃった…ごめんね💦");
    } finally {
      setExporting(false);
    }
  };

  const generatePreviewBlob = async (): Promise<Blob | null> => {
    const node = previewRef.current;
    if (!node) return null;
    if (typeof document !== "undefined" && document.fonts?.ready) {
      await document.fonts.ready;
    }
    const baseOptions = {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: "#ffeef5",
    };
    try {
      return await toBlob(node, baseOptions);
    } catch (e) {
      console.warn(
        "[gogh] font-embedded export failed, retrying with skipFonts:",
        e
      );
      return await toBlob(node, { ...baseOptions, skipFonts: true });
    }
  };

  const handleShareToX = async () => {
    setSharing(true);
    try {
      const blob = await generatePreviewBlob();
      if (!blob) {
        alert("画像の作成に失敗しちゃった…ごめんね💦");
        return;
      }
      const safeName =
        (name || "gogh_profile").replace(/[^\p{L}\p{N}_-]/gu, "_") ||
        "gogh_profile";
      const file = new File([blob], `${safeName}.png`, { type: "image/png" });
      const shareText = "gogh プロフ帳メーカーで作ったよ♡ #gogh #プロフ帳";
      const intentUrl = `https://x.com/intent/post?text=${encodeURIComponent(
        shareText
      )}`;

      // 1) Web Share API with files (mainly mobile / supported desktop)
      const nav = navigator as Navigator & {
        canShare?: (data: { files?: File[] }) => boolean;
      };
      if (
        typeof nav.share === "function" &&
        typeof nav.canShare === "function" &&
        nav.canShare({ files: [file] })
      ) {
        try {
          await nav.share({ files: [file], text: shareText });
          return;
        } catch (e) {
          if ((e as DOMException)?.name === "AbortError") return;
          console.warn("[gogh] navigator.share failed, falling back:", e);
        }
      }

      // 2) Clipboard + open X compose (desktop fallback)
      if (
        typeof ClipboardItem !== "undefined" &&
        navigator.clipboard?.write
      ) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          window.open(intentUrl, "_blank", "noopener,noreferrer");
          alert(
            "画像をコピーしたよ✨\nXの投稿画面で Ctrl/⌘ + V で貼ってね💕"
          );
          return;
        } catch (e) {
          console.warn("[gogh] clipboard write failed:", e);
        }
      }

      // 3) Last resort: open X compose, ask user to save manually
      window.open(intentUrl, "_blank", "noopener,noreferrer");
      alert(
        "このブラウザでは画像をそのまま渡せないみたい💦\n「画像で保存」してから添付してね"
      );
    } catch (err) {
      console.error(err);
      alert("Xへの共有に失敗しちゃった…ごめんね💦");
    } finally {
      setSharing(false);
    }
  };

  const handleReset = () => {
    if (!confirm("入力した内容をぜんぶ消しちゃっていい？")) return;
    setName("");
    setXHandle("");
    setAvatar(null);
    setValues(initialValues);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const cleanXHandle = xHandle.replace(/^@+/, "").trim();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <header className="mb-8 text-center">
        <div className="inline-block">
          <h1
            className="text-pop-shadow text-4xl font-bold tracking-wider text-pink sm:text-5xl"
            style={{ fontFamily: "var(--font-pop)" }}
          >
            ☆ gogh プロフ帳 メーカー ☆
          </h1>
        </div>
        <p
          className="mt-3 text-sm text-pink"
          style={{ fontFamily: "var(--font-handwriting)" }}
        >
          書きこんで、画像で保存して、Ｘに貼っちゃお〜♪
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* ────────── form ────────── */}
        <section className="space-y-5">
          {/* avatar uploader */}
          <div className="rounded-2xl border-2 border-dashed border-pink bg-white/70 p-4">
            <label
              className="mb-2 block text-sm font-semibold text-pink"
              style={{ fontFamily: "var(--font-pop)" }}
            >
              ☆ アバター画像
            </label>
            <div className="flex items-center gap-4">
              <div className="avatar-frame shrink-0">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="avatar preview"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl"
                    style={{ fontFamily: "var(--font-pop)" }}
                  >
                    📷
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleAvatarChange(e.target.files?.[0] ?? null)
                  }
                  className="block w-full text-sm text-pink-700 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-pink file:px-4 file:py-1.5 file:font-semibold file:text-white hover:file:opacity-90"
                />
                {avatar && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatar(null);
                      if (fileInputRef.current)
                        fileInputRef.current.value = "";
                    }}
                    className="self-start text-xs text-pink-500 underline"
                  >
                    画像を消す
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* basic: name + X */}
          <div className="rounded-2xl border-2 border-pink-soft bg-white/70 p-4">
            <label
              className="mb-1 block text-sm font-semibold text-pink"
              style={{ fontFamily: "var(--font-pop)" }}
              htmlFor="f-name"
            >
              ☆ お名前 / ニックネーム
            </label>
            <input
              id="f-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ぴよこ"
              className="w-full rounded-xl border border-pink-200 bg-white px-3 py-2 text-pink-900 outline-none focus:border-pink focus:ring-2 focus:ring-pink-soft"
            />

            <label
              className="mb-1 mt-4 block text-sm font-semibold text-pink"
              style={{ fontFamily: "var(--font-pop)" }}
              htmlFor="f-x"
            >
              ✕ X (Twitter) ユーザー名
            </label>
            <div className="flex items-center rounded-xl border border-pink-200 bg-white px-3 py-2 focus-within:border-pink focus-within:ring-2 focus-within:ring-pink-soft">
              <span className="mr-1 text-pink-400">@</span>
              <input
                id="f-x"
                type="text"
                value={xHandle}
                onChange={(e) => setXHandle(e.target.value)}
                placeholder="your_handle"
                className="w-full bg-transparent text-pink-900 outline-none"
                autoCapitalize="none"
                spellCheck={false}
              />
            </div>
            <p className="mt-1 text-xs text-pink-400">
              ※ 空欄なら表示されません
            </p>
          </div>

          {/* dynamic fields */}
          {FIELDS.map((f) => (
            <div
              key={f.key}
              className="rounded-2xl border border-pink-soft bg-white/70 p-4 shadow-sm"
            >
              <label
                className="mb-1 block text-sm font-semibold text-pink"
                style={{ fontFamily: "var(--font-pop)" }}
                htmlFor={`f-${f.key}`}
              >
                <span className="mr-1">{f.emoji}</span>
                {f.label}
              </label>
              {f.multiline ? (
                <textarea
                  id={`f-${f.key}`}
                  value={values[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-pink-200 bg-white px-3 py-2 text-pink-900 outline-none focus:border-pink focus:ring-2 focus:ring-pink-soft"
                />
              ) : (
                <input
                  id={`f-${f.key}`}
                  type="text"
                  value={values[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full rounded-xl border border-pink-200 bg-white px-3 py-2 text-pink-900 outline-none focus:border-pink focus:ring-2 focus:ring-pink-soft"
                />
              )}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {f.suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update(f.key, s)}
                    className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs text-pink-700 transition hover:bg-pink-100 active:scale-95"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={exporting}
              className="rounded-full bg-pink px-6 py-2.5 font-semibold text-white shadow-md transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ fontFamily: "var(--font-pop)" }}
            >
              {exporting ? "保存中…" : "❤︎ 画像で保存 ❤︎"}
            </button>
            <button
              type="button"
              onClick={handleShareToX}
              disabled={sharing}
              className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-2.5 font-semibold text-white shadow-md transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ fontFamily: "var(--font-pop)" }}
            >
              <XIcon className="h-4 w-4" />
              {sharing ? "じゅんび中…" : "Xにそのまま投稿"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full border-2 border-pink bg-white px-5 py-2.5 font-semibold text-pink transition hover:bg-pink-50 active:scale-95"
              style={{ fontFamily: "var(--font-pop)" }}
            >
              リセット
            </button>
          </div>
        </section>

        {/* ────────── preview ────────── */}
        <section className="lg:sticky lg:top-6 lg:self-start">
          <p
            className="mb-2 text-center text-xs text-pink"
            style={{ fontFamily: "var(--font-handwriting)" }}
          >
            ↓ プレビュー（このまま画像になります）
          </p>

          {/* Striped multicolor outer frame */}
          <div
            ref={previewRef}
            className="frame-stripe mx-auto"
            style={{ width: "100%", maxWidth: 540 }}
          >
            {/* Inner paper */}
            <div className="relative overflow-hidden rounded-[18px] bg-dots p-7">
              {/* washi tape decorations */}
              <div
                className="washi washi-pink"
                style={{ top: -8, left: 24 }}
              />
              <div
                className="washi washi-mint"
                style={{ top: -8, right: 24, transform: "rotate(10deg)" }}
              />
              <div
                className="washi washi-yellow"
                style={{ bottom: -8, left: 36, transform: "rotate(8deg)" }}
              />
              <div
                className="washi washi-lavender"
                style={{ bottom: -8, right: 30, transform: "rotate(-10deg)" }}
              />

              {/* sparkles */}
              <span className="pointer-events-none absolute left-3 top-12 text-xl">
                ✿
              </span>
              <span className="pointer-events-none absolute right-3 top-20 text-lg">
                ★
              </span>
              <span className="pointer-events-none absolute left-4 top-1/2 text-base">
                ♡
              </span>
              <span className="pointer-events-none absolute right-4 bottom-24 text-lg">
                ✦
              </span>

              {/* Title band */}
              <div className="mb-4 text-center">
                <h2
                  className="text-pop-shadow inline-block text-2xl text-pink"
                  style={{ fontFamily: "var(--font-pop)" }}
                >
                  ♡ プ ロ フ ィ ー ル ♡
                </h2>
                <div className="zigzag mx-auto mt-2 w-3/4" />
              </div>

              {/* Avatar + basic info */}
              <div className="mb-5 flex items-center gap-4">
                <div className="avatar-frame shrink-0">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="avatar"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-4xl"
                      style={{ fontFamily: "var(--font-pop)" }}
                    >
                      ☺︎
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="tag tag-pink">なまえ</span>
                  </div>
                  <p
                    className="line-underline mt-1 truncate text-2xl text-pink-900"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {name || "ぴよこ"}
                  </p>
                  {cleanXHandle && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black text-white">
                        <XIcon className="h-3.5 w-3.5" />
                      </span>
                      <span
                        className="line-underline text-base text-pink-800"
                        style={{ fontFamily: "var(--font-handwriting)" }}
                      >
                        @{cleanXHandle}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-3">
                {FIELDS.map((f) => (
                  <div
                    key={f.key}
                    className="rounded-xl border border-white bg-white/70 px-3 py-2"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className={`tag tag-${f.color}`}>
                        {f.emoji} {f.label}
                      </span>
                    </div>
                    <div
                      className="text-base leading-relaxed text-pink-900"
                      style={{ fontFamily: "var(--font-handwriting)" }}
                    >
                      {f.template(values[f.key])}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-6 text-center">
                <div className="zigzag mx-auto mb-2 w-3/4" />
                <p
                  className="text-xs text-pink"
                  style={{ fontFamily: "var(--font-pixel)" }}
                >
                  made with ♡ — gogh プロフ帳メーカー
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer
        className="mt-12 text-center text-xs text-pink"
        style={{ fontFamily: "var(--font-handwriting)" }}
      >
        gogh プロフ帳メーカー · 非公式のファンメイドです
      </footer>
    </main>
  );
}
