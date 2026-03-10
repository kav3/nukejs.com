import { useHtml } from "nukejs"
import CodeBlock from "../../components/docs/CodeBlock"

export default function MiddlewarePage() {
    const title = "Middleware"
    const subtitle = "A single middleware.ts intercepts every request before routing — ideal for auth, logging, CORS, and custom headers."
    useHtml({ title })
    return (
        <article className="doc-article">
            <header className="doc-article-header">
                <h1 className="doc-article-title">{title}</h1>
                <p className="doc-article-subtitle">{subtitle}</p>
            </header>

            <div className="doc-body">
                <h2>Creating middleware</h2>
                <p>Create <code>middleware.ts</code> at the project root and export a default async function. It receives the raw Node.js <code>IncomingMessage</code> and <code>ServerResponse</code> objects:</p>
                <CodeBlock filename="middleware.ts" code={`import type { IncomingMessage, ServerResponse } from 'http'

export default async function middleware(
    req: IncomingMessage,
    res: ServerResponse,
): Promise<void> {
    // Inject a response header on every request
    res.setHeader('X-Powered-By', 'nukejs')
    // Return without ending → request continues to routing
}`} />

                <h2>Halting a request</h2>
                <p>If middleware calls <code>res.end()</code>, NukeJS stops processing and the request never reaches routing:</p>
                <CodeBlock filename="middleware.ts" code={`import type { IncomingMessage, ServerResponse } from 'http'
import { verifyToken } from './lib/auth'

export default async function middleware(
    req: IncomingMessage,
    res: ServerResponse,
) {
    res.setHeader('X-Powered-By', 'nukejs')

    // Auth guard for /admin routes
    if (req.url?.startsWith('/admin')) {
        const token = req.headers.authorization?.split(' ')[1]
        const user = await verifyToken(token)

        if (!user) {
            res.statusCode = 401
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Unauthorized' }))
            return // ← halts, routing is never reached
        }
    }
    // falls through → normal routing
}`} />

                <h2>Request logging</h2>
                <CodeBlock filename="middleware.ts" code={`export default async function middleware(req, res) {
    const start = Date.now()

    res.on('finish', () => {
        const ms = Date.now() - start
        console.log(\`\${req.method} \${req.url} \${res.statusCode} — \${ms}ms\`)
    })
}`} />

                <h2>CORS headers</h2>
                <CodeBlock filename="middleware.ts" code={`export default async function middleware(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (req.method === 'OPTIONS') {
        res.statusCode = 204
        res.end()
        return
    }
}`} />

                <h2>Rate limiting</h2>
                <CodeBlock filename="middleware.ts" code={`const requests = new Map<string, number[]>()

export default async function middleware(req, res) {
    const ip = req.socket.remoteAddress ?? 'unknown'
    const now = Date.now()
    const window = 60_000 // 1 minute
    const limit = 100

    const hits = (requests.get(ip) ?? []).filter(t => now - t < window)
    hits.push(now)
    requests.set(ip, hits)

    if (hits.length > limit) {
        res.statusCode = 429
        res.end('Too Many Requests')
        return
    }
}`} />

                <h2>URL rewriting</h2>
                <p>Rewrite the request URL before routing to serve the same content under a different path:</p>
                <CodeBlock filename="middleware.ts" code={`export default async function middleware(req, res) {
    // Serve /home from the index route
    if (req.url === '/home') {
        req.url = '/'
    }

    // Redirect legacy /old-path to /new-path
    if (req.url?.startsWith('/old-path')) {
        res.statusCode = 301
        res.setHeader('Location', req.url.replace('/old-path', '/new-path'))
        res.end()
        return
    }
}`} />

                <div className="doc-callout warning">
                    <span className="doc-callout-icon">⚠️</span>
                    <div className="doc-callout-body">
                        <strong>One middleware file only</strong>{" "}
                        NukeJS supports a single <code>middleware.ts</code> at the project root.
                        Dispatch to different handlers inside that one file based on <code>req.url</code>.
                    </div>
                </div>
            </div>
        </article>
    )
}