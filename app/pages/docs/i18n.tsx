import { useHtml } from "nukejs"
import CodeBlock from "../../components/docs/CodeBlock"

export default function I18nPage() {
    const title = "Internationalisation (i18n)"
    const subtitle = "Add multi-language support with locale-based routing, a tiny useI18n() hook, and plain JSON translation files — no third-party library required."
    useHtml({ title })
    return (
        <article className="doc-article">
            <header className="doc-article-header">
                <h1 className="doc-article-title">{title}</h1>
                <p className="doc-article-subtitle">{subtitle}</p>
            </header>

            <div className="doc-body">

                {/* ── Starter template ─────────────────────────────── */}
                <div className="doc-callout tip">
                    <span className="doc-callout-icon">🚀</span>
                    <div className="doc-callout-body">
                        <strong>Prefer to start from a working project?</strong>{" "}
                        Everything on this page mirrors{" "}
                        <a href="https://github.com/unenterprise/i18n-shadcn-nukejs" target="_blank" rel="noopener noreferrer">
                            i18n-shadcn-nukejs
                        </a>
                        , an official starter with <a href="/docs/examples/shadcn">shadcn/ui</a> and this exact
                        i18n setup wired up out of the box. Scaffold it with{" "}
                        <code>npx degit unenterprise/i18n-shadcn-nukejs</code>.
                    </div>
                </div>

                {/* ── How it works ─────────────────────────────────── */}
                <h2>How it works</h2>
                <p>
                    NukeJS has no built-in i18n API. Instead, internationalisation is wired up
                    with three pieces that each do one job:
                </p>
                <p>
                    The <strong>default locale is served unprefixed</strong> at <code>/</code>{" "}
                    from <code>app/pages/index.tsx</code>, while every other locale gets a{" "}
                    <code>[locale]</code> prefix segment (<code>/fr</code>, <code>/fr/about</code>)
                    served from <code>app/pages/[locale]/index.tsx</code>. A <code>useI18n()</code>{" "}
                    hook reads the resolved locale via <code>useRequest()</code> and returns the
                    matching JSON translations. <code>middleware.ts</code> keeps exactly one
                    canonical URL per page — redirecting <code>/en</code> to <code>/</code> — and
                    404s any unknown single-segment path instead of silently falling back to
                    English. The whole setup is server-only — no runtime i18n overhead reaches
                    the browser.
                </p>

                {/* ── Project structure ────────────────────────────── */}
                <h2>Project structure</h2>
                <p>Add a <code>locales/</code> folder for JSON files and a <code>lib/</code> folder for the hook. Only <em>non-default</em> locales live under a <code>[locale]</code> segment — the default locale's page sits directly in <code>app/pages/</code>:</p>
                <CodeBlock language="bash" code={`my-app/
├── app/
│   ├── components/
│   │   └── LangSwitcher.tsx     # "use client" switcher component
│   ├── lib/
│   │   └── useI18n.ts           # locale hook
│   ├── locales/
│   │   ├── en.json              # English strings (source of truth)
│   │   └── fr.json              # French strings  (must match en.json shape)
│   └── pages/
│       ├── index.tsx            # default locale ("en") → "/"
│       └── [locale]/
│           └── index.tsx        # every other locale → "/fr", "/de", ...
└── middleware.ts                # /en → "/" redirect + unknown-locale 404 guard`} />

                {/* ── Translation files ────────────────────────────── */}
                <h2>Translation files</h2>
                <p>
                    Every locale file shares the exact same shape. <code>en.json</code> is the
                    source of truth — TypeScript infers the <code>Translations</code> type from it,
                    so a missing or misspelled key in any other locale file is a compile error.
                </p>
                <CodeBlock filename="app/locales/en.json" language="json" code={`{
  "meta": { "lang": "en", "dir": "ltr" },

  "site": {
    "title": "NukeJS — Your next project",
    "description": "NukeJS has got you. A minimal, opinionated full-stack React framework with SSR, HMR, file-based routing, and API routes out of the box."
  },

  "nav": {
    "docs": "Docs",
    "github": "GitHub"
  },

  "hero": {
    "eyebrow": "React. Weaponized.",
    "headline": "Your next project",
    "slug": "NukeJS has got you",
    "body": "Server-render everything, hydrate only what moves. File-based routing, API routes, and zero-config deploys — ready before you finish your coffee.",
    "primaryCta": "Get started",
    "secondaryCta": "Read the docs"
  },

  "actions": {
    "switchLang": "Switch language"
  },

  "footer": {
    "tagline": "Built with NukeJS."
  }
}`} />

                <CodeBlock filename="app/locales/fr.json" language="json" code={`{
  "meta": { "lang": "fr", "dir": "ltr" },

  "site": {
    "title": "NukeJS — Votre prochain projet",
    "description": "NukeJS s'occupe de tout. Un framework React full-stack minimal et opinionné, avec SSR, HMR, routage par fichiers et routes API prêts à l'emploi."
  },

  "nav": {
    "docs": "Documentation",
    "github": "GitHub"
  },

  "hero": {
    "eyebrow": "React. Militarisé.",
    "headline": "Votre prochain projet",
    "slug": "NukeJS s'occupe de tout",
    "body": "Tout est rendu côté serveur, seul ce qui bouge est hydraté. Routage par fichiers, routes API, et déploiements sans configuration — prêts avant la fin de votre café.",
    "primaryCta": "Commencer",
    "secondaryCta": "Lire la documentation"
  },

  "actions": {
    "switchLang": "Changer de langue"
  },

  "footer": {
    "tagline": "Construit avec NukeJS."
  }
}`} />

                {/* ── useI18n hook ─────────────────────────────────── */}
                <h2>The <code>useI18n()</code> hook</h2>
                <p>
                    Create <code>app/lib/useI18n.ts</code>. The hook reads the <code>[locale]</code>{" "}
                    route segment via <code>useRequest()</code>, resolves it to a supported locale
                    (falling back to <code>"en"</code> for anything unrecognised), and returns the
                    matching translation object alongside the resolved locale string. Because{" "}
                    <code>useRequest()</code> is server-only, the entire lookup happens at render
                    time — zero bytes reach the browser.
                </p>
                <CodeBlock filename="app/lib/useI18n.ts" code={`import { useRequest } from "nukejs"
import en from "../locales/en.json"
import fr from "../locales/fr.json"

// ─── Types ────────────────────────────────────────────────────────────

const translations = { en, fr } as const

export type Locale       = keyof typeof translations
export type Translations = typeof en   // fr.json must match this shape exactly

// ─── Locale resolver ──────────────────────────────────────────────────

function resolveLocale(param: string | string[] | undefined): Locale {
    if (!param) return "en"
    const tag = (Array.isArray(param) ? param[0] : param)
        .trim()
        .toLowerCase() as Locale
    return tag in translations ? tag : "en"
}

// ─── Hook ─────────────────────────────────────────────────────────────

export function useI18n(): { t: Translations; locale: Locale } {
    const { params } = useRequest()
    const locale = resolveLocale(params.locale as string | undefined)
    return { t: translations[locale], locale }
}

export const SUPPORTED_LOCALES: Locale[] = Object.keys(translations) as Locale[]`} />

                <div className="doc-callout info">
                    <span className="doc-callout-icon">ℹ️</span>
                    <div className="doc-callout-body">
                        <strong>Type safety is automatic</strong>{" "}
                        TypeScript infers <code>Translations</code> from <code>en.json</code>.
                        If <code>fr.json</code> is missing a key or has a different structure,
                        the build fails before anything ships.
                    </div>
                </div>

                {/* ── Locale-based routing ─────────────────────────── */}
                <h2>Locale-based routing</h2>
                <p>
                    Unlike a scheme where every locale — including the default — lives under a{" "}
                    <code>[locale]</code> prefix, this pattern keeps the default locale unprefixed
                    for a cleaner, more SEO-friendly <code>/</code> instead of <code>/en</code>.
                    That means the homepage exists as <em>two</em> sibling files that both call{" "}
                    <code>useI18n()</code>:
                </p>
                <CodeBlock filename="app/pages/index.tsx" code={`import { useHtml } from "nukejs"
import { useI18n } from "../lib/useI18n"
import LangSwitcher from "../components/LangSwitcher"

// Default locale ("en") — served unprefixed at "/".
export default function Home() {
    const { t } = useI18n()

    useHtml({
        title: t.site.title,
        htmlAttrs: { lang: t.meta.lang, dir: t.meta.dir },
    })

    return (
        <main>
            <h1>{t.hero.headline}</h1>
            <p>{t.hero.body}</p>
            <LangSwitcher current="en" />
        </main>
    )
}`} />

                <CodeBlock filename="app/pages/[locale]/index.tsx" code={`import { useHtml } from "nukejs"
import { useI18n } from "../../lib/useI18n"
import LangSwitcher from "../../components/LangSwitcher"

// Reached only for *non-default* locales (e.g. "/fr"). Requests to
// "/en" are permanently redirected to "/" by middleware.ts before
// routing ever sees them — see "Canonicalizing the default locale" below.
export default function Home() {
    const { t, locale } = useI18n()

    useHtml({
        title: t.site.title,
        htmlAttrs: { lang: t.meta.lang, dir: t.meta.dir },
    })

    return (
        <main>
            <h1>{t.hero.headline}</h1>
            <p>{t.hero.body}</p>
            <LangSwitcher current={locale} />
        </main>
    )
}`} />

                <div className="doc-callout tip">
                    <span className="doc-callout-icon">✅</span>
                    <div className="doc-callout-body">
                        <strong>Set <code>lang</code> and <code>dir</code> on every page</strong>{" "}
                        Passing <code>{'htmlAttrs: { lang: t.meta.lang, dir: t.meta.dir }'}</code> through
                        {" "}<code>useHtml()</code> writes the correct attributes to the{" "}
                        <code>{"<html>"}</code> tag on every server render. Screen readers, browser
                        translation prompts, and search engines all rely on this.
                    </div>
                </div>

                {/* ── Language switcher ────────────────────────────── */}
                <h2>Language switcher</h2>
                <p>
                    The switcher is a client component so it can react to clicks without a full page reload.
                    It strips off any existing locale prefix, then re-applies the target locale's prefix —
                    or no prefix at all, if the target is the default locale — before calling{" "}
                    <code>router.push()</code> for a client-side transition:
                </p>
                <CodeBlock filename="app/components/LangSwitcher.tsx" code={`"use client"
import { useRouter } from "nukejs"
import type { Locale } from "../lib/useI18n"

const DEFAULT_LOCALE: Locale = "en"
// Locales that keep a URL prefix. The default locale is served unprefixed.
const PREFIXED_LOCALES: Locale[] = ["fr"]

const LOCALES: { code: Locale; label: string }[] = [
    { code: "en", label: "English" },
    { code: "fr", label: "Français" },
]

const PREFIX_PATTERN = new RegExp(\`^/(\${PREFIXED_LOCALES.join("|")})(?=/|\$)\`)

export default function LangSwitcher({ current }: { current: Locale }) {
    const router = useRouter()

    function switchTo(next: Locale) {
        // Strip any existing prefixed-locale segment, then re-apply the
        // target locale's prefix (none for the default locale).
        // e.g. "/fr/about" -> "/about" -> "/about" (en) or "/fr/about" (fr)
        const stripped = window.location.pathname.replace(PREFIX_PATTERN, "") || "/"
        const target = next === DEFAULT_LOCALE
            ? stripped
            : \`/\${next}\${stripped === "/" ? "" : stripped}\`
        router.push(target)
    }

    return (
        <div>
            {LOCALES.map(({ code, label }) => (
                <button
                    key={code}
                    onClick={() => switchTo(code)}
                    disabled={code === current}
                    aria-current={code === current ? "true" : undefined}
                    aria-label={\`Switch to \${label}\`}
                >
                    {label}
                </button>
            ))}
        </div>
    )
}`} />

                {/* ── Middleware canonicalization ──────────────────── */}
                <h2>Canonicalizing the default locale</h2>
                <p>
                    Use <code>middleware.ts</code> to keep exactly one canonical URL per page.
                    It runs before every request, so it's the right place to permanently redirect{" "}
                    <code>/en</code> to <code>/</code>, and to reject any unrecognised single-segment
                    path with a real 404 instead of letting <code>useI18n()</code> silently fall back
                    to English:
                </p>
                <CodeBlock filename="middleware.ts" code={`import type { IncomingMessage, ServerResponse } from "http"

// The default locale is served unprefixed at "/" (e.g. "/", "/about").
// Any other supported locale keeps its prefix (e.g. "/fr", "/fr/about").
const DEFAULT_LOCALE = "en"

// Locales that keep a URL prefix. Must stay in sync with the \`translations\`
// keys in lib/useI18n.ts (everything except DEFAULT_LOCALE).
const PREFIXED_LOCALES = ["fr"]

export default async function middleware(
    req: IncomingMessage,
    res: ServerResponse,
) {
    const rawUrl = req.url ?? "/"
    const queryIndex = rawUrl.indexOf("?")
    const pathname = queryIndex === -1 ? rawUrl : rawUrl.slice(0, queryIndex)
    const query = queryIndex === -1 ? "" : rawUrl.slice(queryIndex)

    // Skip framework internals, API routes, and static assets (anything
    // with a file extension, e.g. /favicon.ico, /styles.css).
    if (
        pathname.startsWith("/__") ||
        pathname.startsWith("/api") ||
        /\\.[a-zA-Z0-9]+\$/.test(pathname)
    ) {
        return
    }

    // Canonicalize the default locale: \`/en\` and \`/en/...\` permanently
    // redirect to their unprefixed equivalent (\`/\`, \`/...\`). This keeps a
    // single canonical URL per page for SEO and avoids duplicate-content
    // issues between \`/\` and \`/en\`.
    if (pathname === \`/\${DEFAULT_LOCALE}\` || pathname.startsWith(\`/\${DEFAULT_LOCALE}/\`)) {
        const rest = pathname.slice(\`/\${DEFAULT_LOCALE}\`.length) || "/"
        res.statusCode = 301
        res.setHeader("Location", rest + query)
        res.end()
        return
    }

    // \`app/pages/[locale]/index.tsx\` structurally matches ANY single path
    // segment, so \`/anything\` would otherwise render with params.locale =
    // "anything" and useI18n() would silently fall back to English instead
    // of 404ing. Reject single-segment paths that aren't a real prefixed
    // locale here, before routing ever sees them.
    const segments = pathname.split("/").filter(Boolean)
    if (segments.length === 1 && !PREFIXED_LOCALES.includes(segments[0])) {
        res.statusCode = 404
        res.setHeader("Content-Type", "text/plain; charset=utf-8")
        res.end("Not Found")
        return
    }

    // Everything else — unprefixed paths (served as the default locale) and
    // prefixed non-default locales (e.g. \`/fr\`) — passes through to routing.
}`} />

                <div className="doc-callout warning">
                    <span className="doc-callout-icon">⚠️</span>
                    <div className="doc-callout-body">
                        <strong>The 404 guard needs an allowlist as you add pages</strong>{" "}
                        <code>app/pages/[locale]/index.tsx</code> structurally matches <em>any</em>{" "}
                        single path segment. With only a homepage, rejecting unrecognised
                        single-segment paths is safe. The moment you add another top-level
                        unprefixed page (e.g. <code>app/pages/about.tsx</code>), add its slug to
                        an allowlist in the guard above — otherwise it will 404 too.
                    </div>
                </div>

                {/* ── i18n in API routes ───────────────────────────── */}
                <h2>Translations in API routes</h2>
                <p>
                    Server-side handlers in <code>server/</code> don't use the hook. Import the locale
                    files directly and select the right one from <code>req.params</code>:
                </p>
                <CodeBlock filename="server/[locale]/greet.ts" code={`import type { ApiRequest, ApiResponse } from "nukejs"
import en from "../../locales/en.json"
import fr from "../../locales/fr.json"

const translations = { en, fr } as const
type Locale = keyof typeof translations

export async function GET(req: ApiRequest, res: ApiResponse) {
    const raw = req.params.locale as string
    const locale: Locale = raw in translations ? (raw as Locale) : "en"
    const t = translations[locale]

    res.json({
        locale,
        message: t.hero.slug,
        direction: t.meta.dir,
    })
}`} />

                <p><code>GET /greet</code> (default locale) responds with:</p>
                <CodeBlock language="json" code={`{ "locale": "en", "message": "NukeJS has got you", "direction": "ltr" }`} />

                <p><code>GET /fr/greet</code> responds with:</p>
                <CodeBlock language="json" code={`{ "locale": "fr", "message": "NukeJS s'occupe de tout", "direction": "ltr" }`} />

                {/* ── Adding a new locale ──────────────────────────── */}
                <h2>Adding a new locale</h2>
                <p>
                    Adding a third language takes four steps and no new dependencies. New locales
                    always keep a URL prefix — only the original default locale stays unprefixed:
                </p>
                <CodeBlock language="bash" code={`# 1. Copy en.json and translate every value
cp app/locales/en.json app/locales/de.json`} />
                <CodeBlock filename="app/lib/useI18n.ts" code={`import de from "../locales/de.json"

const translations = { en, fr, de } as const  // add de here`} />
                <CodeBlock filename="app/components/LangSwitcher.tsx" code={`const PREFIXED_LOCALES: Locale[] = ["fr", "de"]  // add de here (never the default)

const LOCALES: { code: Locale; label: string }[] = [
    { code: "en", label: "English"  },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch"  },  // add de here
]`} />
                <CodeBlock filename="middleware.ts" code={`const PREFIXED_LOCALES = ["fr", "de"]  // add de here`} />

                <div className="doc-callout info">
                    <span className="doc-callout-icon">ℹ️</span>
                    <div className="doc-callout-body">
                        <strong>TypeScript catches missing keys immediately</strong>{" "}
                        If <code>de.json</code> is missing a key that exists in <code>en.json</code>,
                        the assignment <code>{'const translations = { en, fr, de } as const'}</code> will
                        produce a type error before the build finishes.
                    </div>
                </div>

                {/* ── Quick reference ──────────────────────────────── */}
                <h2>Quick reference</h2>
                <div className="doc-table-wrap">
                    <table className="doc-table">
                        <thead>
                            <tr>
                                <th>File</th>
                                <th>Purpose</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>app/locales/en.json</code></td>
                                <td>English strings — source of truth for TypeScript types</td>
                            </tr>
                            <tr>
                                <td><code>app/locales/fr.json</code></td>
                                <td>French strings — must match <code>en.json</code> shape exactly</td>
                            </tr>
                            <tr>
                                <td><code>app/lib/useI18n.ts</code></td>
                                <td>Hook — reads <code>[locale]</code> param, returns <code>{'{ t, locale }'}</code></td>
                            </tr>
                            <tr>
                                <td><code>app/pages/index.tsx</code></td>
                                <td>Default locale's homepage — served unprefixed at <code>/</code></td>
                            </tr>
                            <tr>
                                <td><code>app/pages/[locale]/index.tsx</code></td>
                                <td>Every other locale's homepage — served at <code>/fr</code>, <code>/de</code>, etc.</td>
                            </tr>
                            <tr>
                                <td><code>app/components/LangSwitcher.tsx</code></td>
                                <td>Client component — swaps locale prefix, navigates client-side</td>
                            </tr>
                            <tr>
                                <td><code>middleware.ts</code></td>
                                <td>Redirects <code>/en</code> → <code>/</code>, 404s unknown locale prefixes</td>
                            </tr>
                            <tr>
                                <td><code>useHtml({'({ htmlAttrs: { lang, dir } })'})</code></td>
                                <td>Writes correct <code>lang</code> and <code>dir</code> to <code>{"<html>"}</code> on every page</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p>
                    See the full working source in{" "}
                    <a href="https://github.com/unenterprise/i18n-shadcn-nukejs" target="_blank" rel="noopener noreferrer">
                        github.com/unenterprise/i18n-shadcn-nukejs
                    </a>
                    .
                </p>
            </div>
        </article>
    )
}