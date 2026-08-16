import { useHtml } from "nukejs"
import CodeBlock from "../../../components/docs/CodeBlock"

export default function CachePage() {
    const title = "Cache"
    const subtitle = "Use cache() for request-scoped data caching. Prevent redundant database queries and API calls within a single request — even when the same data is fetched from multiple components."
    useHtml({ title })
    return (
        <article className="doc-article">
            <header className="doc-article-header">
                <h1 className="doc-article-title">{title}</h1>
                {subtitle && <p className="doc-article-subtitle">{subtitle}</p>}
            </header>

            <div className="doc-body">
                <div className="doc-integration-badge">Core Feature</div>

                <h2>Overview</h2>
                <p>
                    The <code>cache()</code> function wraps any async function to enable automatic
                    request-scoped memoization. When multiple components call the same cached function
                    with identical arguments during a single request, only the first call executes —
                    subsequent calls return the cached result instantly.
                </p>

                <div className="doc-callout info">
                    <span className="doc-callout-icon">ℹ️</span>
                    <div className="doc-callout-body">
                        <strong>Request-scoped, not global</strong>{" "}
                        The cache lives only for the duration of one SSR render. Each new request starts
                        with a fresh, empty cache. This prevents stale data from leaking between requests
                        while eliminating redundant work within the same render tree.
                    </div>
                </div>

                <h2>Basic usage</h2>
                <p>Wrap your data fetching function with <code>cache()</code>:</p>
                <CodeBlock filename="lib/db.ts" code={`import { cache } from 'nukejs'
import { prisma } from './prisma'

// Without cache: every call hits the database
export async function getUser(id: number) {
    return prisma.user.findUnique({ where: { id } })
}

// With cache: first call hits DB, subsequent calls return cached value
export const getCachedUser = cache(async (id: number) => {
    console.log('DB query for user', id)
    return prisma.user.findUnique({ where: { id } })
})`} />

                <h2>Example: Prevent N+1 queries</h2>
                <p>
                    A common pattern: multiple components in the render tree need the same user data.
                    Without caching, each component triggers a separate database query. With <code>cache()</code>,
                    the query runs once and all components share the result.
                </p>

                <CodeBlock filename="app/pages/dashboard.tsx" code={`import { getCachedUser } from '../../lib/db'
import ProfileHeader from '../../components/ProfileHeader'
import RecentActivity from '../../components/RecentActivity'
import Sidebar from '../../components/Sidebar'

export default async function DashboardPage() {
    const userId = 123

    // Three components each call getCachedUser(123)
    // Only the first call hits the database
    return (
        <div>
            <ProfileHeader userId={userId} />
            <RecentActivity userId={userId} />
            <Sidebar userId={userId} />
        </div>
    )
}`} />

                <CodeBlock filename="app/components/ProfileHeader.tsx" code={`import { getCachedUser } from '../lib/db'

export default async function ProfileHeader({ userId }: { userId: number }) {
    // First component to call getCachedUser(123) — executes DB query
    const user = await getCachedUser(userId)
    return <h1>{user.name}</h1>
}`} />

                <CodeBlock filename="app/components/RecentActivity.tsx" code={`import { getCachedUser } from '../lib/db'

export default async function RecentActivity({ userId }: { userId: number }) {
    // Second call with same userId — returns cached result, no DB query
    const user = await getCachedUser(userId)
    return <p>Recent posts by {user.name}</p>
}`} />

                <CodeBlock filename="app/components/Sidebar.tsx" code={`import { getCachedUser } from '../lib/db'

export default async function Sidebar({ userId }: { userId: number }) {
    // Third call — also returns cached result
    const user = await getCachedUser(userId)
    return <aside>Logged in as {user.email}</aside>
}`} />

                <div className="doc-callout tip">
                    <span className="doc-callout-icon">💡</span>
                    <div className="doc-callout-body">
                        <strong>Console output</strong>{" "}
                        With the <code>console.log</code> in <code>getCachedUser</code>, you'll see
                        "DB query for user 123" printed only <strong>once</strong> per request, even though
                        three components called the function.
                    </div>
                </div>

                <h2>Cache key behavior</h2>
                <p>
                    The cache key is computed from the function arguments using <code>JSON.stringify</code>.
                    Arguments must be JSON-serializable (strings, numbers, booleans, arrays, plain objects).
                    Functions, symbols, and class instances cannot be cached and will bypass the cache silently.
                </p>

                <CodeBlock filename="lib/db.ts" code={`import { cache } from 'nukejs'

export const getPostsByTag = cache(async (tags: string[]) => {
    // Arrays are serialized for the cache key:
    // ['react', 'ssr'] and ['react', 'ssr'] → same key (cached)
    // ['react', 'ssr'] and ['ssr', 'react'] → different keys (separate calls)
    return db.posts.findMany({ where: { tags: { hasEvery: tags } } })
})

export const getPost = cache(async (id: number, options: { draft?: boolean }) => {
    // Object arguments work too:
    // (1, { draft: true }) and (1, { draft: true }) → same key
    // (1, { draft: true }) and (1, { draft: false }) → different keys
    return db.posts.findUnique({ where: { id }, include: { author: options.draft } })
})`} />

                <h2>Example: Cascading data dependencies</h2>
                <p>
                    Use <code>cache()</code> to share intermediate results across unrelated parts of
                    the component tree without prop drilling or global state:
                </p>

                <CodeBlock filename="lib/data.ts" code={`import { cache } from 'nukejs'
import { prisma } from './prisma'

export const getCurrentUser = cache(async (sessionToken: string) => {
    // Expensive session lookup
    const session = await prisma.session.findUnique({
        where: { token: sessionToken },
        include: { user: true }
    })
    return session?.user ?? null
})

export const getUserProjects = cache(async (sessionToken: string) => {
    // Reuses getCurrentUser result if already cached
    const user = await getCurrentUser(sessionToken)
    if (!user) return []
    return prisma.project.findMany({ where: { ownerId: user.id } })
})

export const getUserNotifications = cache(async (sessionToken: string) => {
    // Also reuses getCurrentUser result
    const user = await getCurrentUser(sessionToken)
    if (!user) return []
    return prisma.notification.findMany({
        where: { userId: user.id, read: false }
    })
})`} />

                <CodeBlock filename="app/pages/workspace.tsx" code={`import { getCurrentUser, getUserProjects, getUserNotifications } from '../../lib/data'
import { useRequest } from 'nukejs'

export default async function WorkspacePage() {
    const { headers } = useRequest()
    const token = headers['x-session-token'] ?? ''

    // All three functions call getCurrentUser(token) internally,
    // but the session lookup runs only once
    const [user, projects, notifications] = await Promise.all([
        getCurrentUser(token),
        getUserProjects(token),
        getUserNotifications(token),
    ])

    if (!user) return <p>Please log in</p>

    return (
        <main>
            <h1>Welcome, {user.name}</h1>
            <p>You have {notifications.length} unread notifications</p>
            <ul>
                {projects.map(p => <li key={p.id}>{p.name}</li>)}
            </ul>
        </main>
    )
}`} />

                <h2>When to use cache()</h2>
                <div className="doc-table-wrap">
                    <table className="doc-table">
                        <thead><tr><th>Use case</th><th>Benefit</th></tr></thead>
                        <tbody>
                            <tr>
                                <td>Shared data across multiple components</td>
                                <td>Fetch once at the top level, call everywhere without prop drilling</td>
                            </tr>
                            <tr>
                                <td>Cascading dependencies (user → projects → tasks)</td>
                                <td>Each level can call the parent function; intermediate results are cached</td>
                            </tr>
                            <tr>
                                <td>Layout + page both need the same data</td>
                                <td>Both can fetch independently; cache ensures only one network/DB call</td>
                            </tr>
                            <tr>
                                <td>Heavy computation (parsing, sorting, aggregation)</td>
                                <td>Run once per request even if multiple components need the result</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h2>Limitations</h2>
                <ul>
                    <li><strong>Server-only</strong> — <code>cache()</code> works during SSR. It has no effect in client components or after hydration.</li>
                    <li><strong>Arguments must be serializable</strong> — Functions, symbols, and complex objects are not cached. The call falls through to the original function.</li>
                    <li><strong>Request-scoped</strong> — Cache entries do not persist across requests. For cross-request caching, use a separate solution like Redis or an in-memory LRU cache.</li>
                    <li><strong>Async only</strong> — The function passed to <code>cache()</code> must return a Promise. Synchronous functions are not supported.</li>
                </ul>

                <div className="doc-callout warning">
                    <span className="doc-callout-icon">⚠️</span>
                    <div className="doc-callout-body">
                        <strong>Promise rejection invalidates the cache entry</strong>{" "}
                        If the wrapped function throws or rejects, that specific cache entry is deleted
                        immediately. A retry with the same arguments will execute the function again rather
                        than returning a cached rejection.
                    </div>
                </div>

                <h2>TypeScript</h2>
                <p>The <code>cache()</code> function preserves the type signature of the wrapped function:</p>
                <CodeBlock filename="lib/data.ts" code={`import { cache } from 'nukejs'

// Fully typed, including parameters and return type
export const getUser = cache(async (id: number): Promise<User | null> => {
    return prisma.user.findUnique({ where: { id } })
})

// Usage is fully type-safe
const user = await getUser(123)       // user: User | null
const invalid = await getUser('abc')  // ❌ TypeScript error`} />
            </div>
        </article>
    )
}
