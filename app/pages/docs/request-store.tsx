import { useHtml } from "nukejs"
import CodeBlock from "../../components/docs/CodeBlock"

export default function RequestStorePage() {
    const title = "Request Store"
    const subtitle = "Server-only access to the current request context — headers, params, and query string — outside of a React component."
    useHtml({ title })
    const prev = { href: "/docs/use-request", label: "useRequest()" }
    const next = { href: "/docs/configuration", label: "Configuration" }
    return (
        <article className="doc-article">
            <header className="doc-article-header">
                <h1 className="doc-article-title">{title}</h1>
                {subtitle && <p className="doc-article-subtitle">{subtitle}</p>}
            </header>

            <div className="doc-body">
                <p>
                    <code>getRequestStore()</code> is the server-side counterpart to{" "}
                    <a href="/docs/use-request"><code>useRequest()</code></a>. Where{" "}
                    <code>useRequest()</code> is a React hook that can only be called inside a
                    component, <code>getRequestStore()</code> has no such restriction — use it
                    in utility functions, data-fetching helpers, and service layers that are
                    called from server components.
                </p>
                <p>
                    It returns <code>null</code> when called outside an active request scope:
                    in the browser, in tests, or after rendering has finished. Always guard
                    the return value.
                </p>

                <h2>Basic usage</h2>
                <CodeBlock filename="app/lib/auth.ts" code={`import { getRequestStore } from 'nukejs'

export async function getCurrentUser() {
    const ctx = getRequestStore()
    if (!ctx) return null

    const token = ctx.headers['authorization']
    if (!token) return null

    return verifyToken(token)
}`} />
                <p>Call the helper from any server component without threading props down the tree:</p>
                <CodeBlock filename="app/pages/dashboard.tsx" code={`import { getCurrentUser } from '../lib/auth'

export default async function Dashboard() {
    const user = await getCurrentUser()
    if (!user) return <p>Not logged in.</p>

    return <h1>Welcome, {user.name}</h1>
}`} />

                <h2>The RequestContext object</h2>
                <div className="doc-table-wrap">
                    <table className="doc-table">
                        <thead>
                            <tr><th>Field</th><th>Type</th><th>Description</th></tr>
                        </thead>
                        <tbody>
                            <tr><td><code>url</code></td><td>string</td><td>Full URL with query string, e.g. <code>/blog/hello?lang=en</code></td></tr>
                            <tr><td><code>pathname</code></td><td>string</td><td>Path only, no query string, e.g. <code>/blog/hello</code></td></tr>
                            <tr><td><code>params</code></td><td>Record&lt;string, string | string[]&gt;</td><td>Dynamic route segments matched by the file-system router</td></tr>
                            <tr><td><code>query</code></td><td>Record&lt;string, string | string[]&gt;</td><td>Query-string params. Multi-value keys become arrays.</td></tr>
                            <tr><td><code>headers</code></td><td>Record&lt;string, string&gt;</td><td>All incoming request headers including <code>cookie</code> and <code>authorization</code>. Multi-value headers are joined with <code>', '</code>.</td></tr>
                        </tbody>
                    </table>
                </div>
                <p>
                    Unlike <code>useRequest()</code> on the client, the server-side store
                    always contains the <strong>full set of headers</strong> — including{" "}
                    <code>cookie</code>, <code>authorization</code>, and <code>x-api-key</code>.
                    These are stripped before the context is embedded in the HTML document so
                    they never reach the browser.
                </p>

                <h2>Forwarding auth headers</h2>
                <p>
                    A common pattern is reading <code>cookie</code> or{" "}
                    <code>authorization</code> in a shared fetch helper and forwarding them to
                    an internal service:
                </p>
                <CodeBlock filename="app/lib/api.ts" code={`import { getRequestStore } from 'nukejs'

export async function apiFetch(path: string) {
    const ctx = getRequestStore()
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    }

    if (ctx?.headers['cookie']) {
        headers['cookie'] = ctx.headers['cookie']
    }

    const res = await fetch(\`http://localhost:4000\${path}\`, { headers })
    if (!res.ok) throw new Error(\`API error \${res.status}\`)
    return res.json()
}`} />
                <CodeBlock filename="app/pages/profile.tsx" code={`import { apiFetch } from '../lib/api'

export default async function Profile() {
    const user = await apiFetch('/me') // cookie forwarded automatically

    return (
        <main>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
        </main>
    )
}`} />

                <h2>Detecting locale from headers</h2>
                <p>
                    Reading <code>accept-language</code> in a utility is a clean foundation
                    for i18n without polluting component props:
                </p>
                <CodeBlock filename="app/lib/locale.ts" code={`import { getRequestStore } from 'nukejs'

const SUPPORTED = ['en', 'fr', 'de'] as const
type Locale = typeof SUPPORTED[number]

export function getLocale(): Locale {
    const ctx = getRequestStore()

    const fromQuery = ctx?.query.lang as string | undefined
    if (fromQuery && SUPPORTED.includes(fromQuery as Locale)) {
        return fromQuery as Locale
    }

    const header = ctx?.headers['accept-language'] ?? ''
    const tag = header.split(',')[0]?.split('-')[0]?.trim().toLowerCase()
    return (SUPPORTED.includes(tag as Locale) ? tag : 'en') as Locale
}`} />

                <h2>Null safety</h2>
                <p>
                    <code>getRequestStore()</code> returns <code>null</code> when called
                    outside an active request — during module initialisation, in tests, or
                    anywhere in client-side code. Use optional chaining or an explicit guard:
                </p>
                <CodeBlock filename="app/lib/locale.ts" code={`const ctx = getRequestStore()

// Optional chaining — returns undefined if ctx is null
const locale = ctx?.headers['accept-language'] ?? 'en'

// Explicit guard — return early when outside SSR
if (!ctx) return defaultValue`} />

                <h2>API reference</h2>
                <div className="doc-table-wrap">
                    <table className="doc-table">
                        <thead>
                            <tr><th>API</th><th>Description</th></tr>
                        </thead>
                        <tbody>
                            <tr><td><code>getRequestStore()</code></td><td>Returns the current <code>RequestContext</code>, or <code>null</code> outside an active SSR request.</td></tr>
                            <tr><td><code>normaliseHeaders(raw)</code></td><td>Converts Node's <code>IncomingMessage.headers</code> to a flat <code>Record&lt;string, string&gt;</code>. Multi-value headers are joined with <code>', '</code>.</td></tr>
                            <tr><td><code>sanitiseHeaders(raw)</code></td><td>Same as <code>normaliseHeaders</code> but strips sensitive headers (<code>cookie</code>, <code>authorization</code>, <code>proxy-authorization</code>, <code>set-cookie</code>, <code>x-api-key</code>) before embedding in the HTML document.</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </article>
    )
}