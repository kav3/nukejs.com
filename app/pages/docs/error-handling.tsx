import { useHtml } from "nukejs"
import CodeBlock from "../../components/docs/CodeBlock"

export default function ErrorHandlingPage() {
    const title = "Error Pages"
    const subtitle = "Custom _404.tsx and _500.tsx pages — file-based, layout-aware, and fully typed with error props."
    useHtml({ title })
    return (
        <article className="doc-article">
            <header className="doc-article-header">
                <h1 className="doc-article-title">{title}</h1>
                <p className="doc-article-subtitle">{subtitle}</p>
            </header>

            <div className="doc-body">

                <h2>Overview</h2>
                <p>
                    Place <code>_404.tsx</code> and <code>_500.tsx</code> directly in <code>app/pages/</code>.
                    They are standard server components and support everything regular pages do: layouts,{" "}
                    <code>useHtml()</code>, client components, and HMR in dev.
                    The underscore prefix tells NukeJS these are reserved error pages — they are{" "}
                    <strong>excluded from routing</strong>, so <code>/_404</code> and <code>/_500</code> are
                    never reachable as URLs.
                </p>

                {/* ── _404.tsx ─────────────────────────────────────── */}
                <h2><code>_404.tsx</code> — Page Not Found</h2>
                <p>
                    Rendered whenever no route matches the requested URL. NukeJS automatically
                    responds with a <code>404</code> HTTP status code.
                </p>
                <CodeBlock filename="app/pages/_404.tsx" code={`import { useHtml } from 'nukejs'
import { Link } from 'nukejs'

export default function NotFound() {
    useHtml({ title: 'Page Not Found' })

    return (
        <main>
            <h1>404 — Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
            <Link href="/">Go home</Link>
        </main>
    )
}`} />

                <div className="doc-callout info">
                    <span className="doc-callout-icon">ℹ️</span>
                    <div className="doc-callout-body">
                        <strong>Layouts wrap error pages too</strong>{" "}
                        The root <code>layout.tsx</code> is applied to both <code>_404.tsx</code> and{" "}
                        <code>_500.tsx</code>, so your nav and footer appear automatically — no extra wiring needed.
                    </div>
                </div>

                {/* ── _500.tsx ─────────────────────────────────────── */}
                <h2><code>_500.tsx</code> — Internal Server Error</h2>
                <p>
                    Rendered when a page handler throws an unhandled error. NukeJS automatically
                    forwards error details as props so you can surface them — especially useful
                    during development.
                </p>
                <CodeBlock filename="app/pages/_500.tsx" code={`import { useHtml } from 'nukejs'
import { Link } from 'nukejs'

interface ErrorProps {
    errorMessage?: string  // human-readable error description
    errorStatus?:  string  // HTTP status code if set on the thrown error
    errorStack?:   string  // stack trace — only populated in development
}

export default function ServerError({ errorMessage, errorStack }: ErrorProps) {
    useHtml({ title: 'Something went wrong' })

    return (
        <main>
            <h1>500 — Server Error</h1>
            <p>Something went wrong on our end. Please try again.</p>
            {errorMessage && <p><strong>{errorMessage}</strong></p>}
            {errorStack   && <pre>{errorStack}</pre>}
            <Link href="/">Go home</Link>
        </main>
    )
}`} />

                <div className="doc-callout info">
                    <span className="doc-callout-icon">ℹ️</span>
                    <div className="doc-callout-body">
                        <strong><code>errorStack</code> is dev-only</strong>{" "}
                        The stack trace is only populated when <code>NODE_ENV !== 'production'</code>.
                        In production, <code>errorStack</code> is always <code>undefined</code>,
                        so the <code>{"<pre>"}</code> block won't render — no accidental leaks.
                    </div>
                </div>

                {/* ── Server errors ─────────────────────────────────── */}
                <h2>Server errors</h2>
                <p>
                    Any unhandled <code>throw</code> inside a server page component — including async data
                    fetching — routes to <code>_500.tsx</code>. The error message and stack trace are
                    forwarded as props automatically:
                </p>
                <CodeBlock filename="app/pages/dashboard.tsx" code={`export default async function Dashboard() {
    const data = await fetchData() // throws → _500.tsx is rendered
    return <main>{data.name}</main>
}`} />

                <p>
                    Attach a <code>status</code> property to a thrown error to control the HTTP status
                    code sent with the response. The value is forwarded to <code>_500.tsx</code> as the{" "}
                    <code>errorStatus</code> prop:
                </p>
                <CodeBlock filename="app/pages/blog/[slug].tsx" code={`export default async function Post({ slug }: { slug: string }) {
    const post = await db.getPost(slug)

    if (!post) {
        const err = new Error('Post not found')
        ;(err as any).status = 404
        throw err  // _500.tsx receives errorMessage="Post not found", errorStatus="404"
    }

    return <article>{post.title}</article>
}`} />

                {/* ── Client errors ─────────────────────────────────── */}
                <h2>Client errors</h2>
                <p>
                    Unhandled errors in client components and async code are automatically caught and
                    routed to <code>_500.tsx</code> via an in-place SPA navigation — no full page reload.
                    Three mechanisms cover all cases:
                </p>
                <div className="doc-table-wrap">
                    <table className="doc-table">
                        <thead>
                            <tr><th>Mechanism</th><th>What it catches</th></tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>React Error Boundary</td>
                                <td>Render and lifecycle errors in every <code>"use client"</code> component</td>
                            </tr>
                            <tr>
                                <td><code>window.onerror</code></td>
                                <td>Synchronous throws in event handlers and other non-React code</td>
                            </tr>
                            <tr>
                                <td><code>window.onunhandledrejection</code></td>
                                <td>Unhandled <code>Promise</code> rejections from <code>async</code> functions</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <CodeBlock filename="app/components/FaultyButton.tsx" code={`"use client"

export default function FaultyButton() {
    const handleClick = () => {
        throw new Error('Something broke!')  // caught by window.onerror → _500.tsx
    }

    return <button onClick={handleClick}>Click me</button>
}`} />

                <CodeBlock filename="app/components/FaultyFetch.tsx" code={`"use client"
import { useEffect } from 'react'

export default function FaultyFetch() {
    useEffect(() => {
        // Unhandled rejection → caught by window.onunhandledrejection → _500.tsx
        fetch('/api/broken').then(res => {
            if (!res.ok) throw new Error(\`API error \${res.status}\`)
        })
    }, [])

    return <div>Loading...</div>
}`} />

                <p>
                    The <code>_500.tsx</code> page receives <code>errorMessage</code> and{" "}
                    <code>errorStack</code> props from client errors just like server errors, so a
                    single error page handles both origins consistently.
                </p>

                {/* ── 404 in API routes ─────────────────────────────── */}
                <h2>Errors in API routes</h2>
                <p>
                    API routes in <code>server/</code> don't use the error pages — they respond
                    directly. Use <code>res.json()</code> with the appropriate status code:
                </p>
                <CodeBlock filename="server/posts/[id].ts" code={`import type { ApiRequest, ApiResponse } from 'nukejs'

export async function GET(req: ApiRequest, res: ApiResponse) {
    const { id } = req.params as { id: string }
    const post = await db.getPost(id)

    if (!post) {
        res.json({ error: 'Post not found' }, 404)
        return
    }

    res.json(post)
}

export async function POST(req: ApiRequest, res: ApiResponse) {
    try {
        const created = await db.createPost(req.body)
        res.json(created, 201)
    } catch (err) {
        console.error('[POST /posts]', err)
        res.json({ error: 'Internal server error' }, 500)
    }
}`} />

                {/* ── Behaviour table ───────────────────────────────── */}
                <h2>Behaviour reference</h2>
                <div className="doc-table-wrap">
                    <table className="doc-table">
                        <thead>
                            <tr>
                                <th>Scenario</th>
                                <th>Without error page</th>
                                <th>With error page</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Server page throws</td>
                                <td>Plain-text <code>Internal Server Error</code> (500)</td>
                                <td><code>_500.tsx</code> rendered with error props</td>
                            </tr>
                            <tr>
                                <td>Client component render error</td>
                                <td>React crashes the component subtree</td>
                                <td><code>_500.tsx</code> rendered in-place, no reload</td>
                            </tr>
                            <tr>
                                <td>Unhandled event handler throw</td>
                                <td>Browser console error only</td>
                                <td><code>_500.tsx</code> rendered in-place, no reload</td>
                            </tr>
                            <tr>
                                <td>Unhandled promise rejection</td>
                                <td>Browser console error only</td>
                                <td><code>_500.tsx</code> rendered in-place, no reload</td>
                            </tr>
                            <tr>
                                <td>Unknown URL</td>
                                <td>Plain-text <code>Page not found</code> (404)</td>
                                <td><code>_404.tsx</code> rendered with 404 status</td>
                            </tr>
                            <tr>
                                <td><code>{"<Link>"}</code> to unknown URL</td>
                                <td>Full page reload</td>
                                <td>In-place SPA navigation, no reload</td>
                            </tr>
                            <tr>
                                <td>HMR save of <code>_404.tsx</code> / <code>_500.tsx</code></td>
                                <td>—</td>
                                <td>Current page re-fetches immediately</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* ── Notes ─────────────────────────────────────────── */}
                <div className="doc-callout tip">
                    <span className="doc-callout-icon">✅</span>
                    <div className="doc-callout-body">
                        <strong>Production notes</strong>
                        <p>
                            Both error pages are fully bundled into the production output for Node.js and
                            Vercel — no runtime file-system access is required. The correct HTTP status
                            code (404 or 500) is always set on the response, and <code>errorStack</code> is
                            stripped in production so stack traces never reach end users.
                        </p>
                    </div>
                </div>

            </div>
        </article>
    )
}