import { useHtml } from "nukejs"
import CodeBlock from "../../components/docs/CodeBlock"

export default function LinkNavigationPage() {
    const title = "Navigation"
    const subtitle = "NukeJS provides a Link component and useRouter hook for client-side navigation without full page reloads."
    useHtml({ title })
    return (
        <article className="doc-article">
            <header className="doc-article-header">
                <h1 className="doc-article-title">{title}</h1>
                <p className="doc-article-subtitle">{subtitle}</p>
            </header>

            <div className="doc-body">
                <h2>The Link component</h2>
                <p>Use <code>{'<Link>'}</code> from <code>nukejs</code> for internal navigation. After the first SSR, Link navigates client-side — no full reload, instant transitions.</p>
                <CodeBlock filename="app/components/Nav.tsx" code={`import { Link } from 'nukejs'

export default function Nav() {
    return (
        <nav>
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/docs">Docs</Link>
        </nav>
    )
}`} />

                <div className="doc-callout info">
                    <span className="doc-callout-icon">ℹ️</span>
                    <div className="doc-callout-body">
                        <strong>Link works in server components</strong>{" "}
                        Unlike some frameworks, NukeJS's <code>Link</code> does not need to be inside a <code>"use client"</code> component.
                        It renders as a plain <code>&lt;a&gt;</code> tag that the NukeJS runtime intercepts in the browser.
                    </div>
                </div>

                <h3>className prop</h3>
                <p>
                    Pass a <code>className</code> prop to style the underlying{" "}
                    <code>&lt;a&gt;</code> element:
                </p>
                <CodeBlock filename="app/components/Nav.tsx" code={`import { Link } from 'nukejs'

export default function Nav() {
    return (
        <nav>
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/about" className="nav-link">About</Link>
            <Link href="/pricing" className="nav-link nav-link--cta">Pricing</Link>
        </nav>
    )
}`} />

                <h2>Active link styling</h2>
                <p>Use <code>useRouter</code> inside a client component to read the current path and apply an active class:</p>
                <CodeBlock filename="app/components/Nav.tsx" code={`"use client"
import { Link, useRouter } from 'nukejs'

export default function Nav() {
    const router = useRouter()

    return (
        <nav>
            {[
                { href: '/', label: 'Home' },
                { href: '/about', label: 'About' },
                { href: '/blog', label: 'Blog' },
            ].map(({ href, label }) => (
                <Link
                    key={href}
                    href={href}
                    className={router.path === href ? 'active' : ''}
                >
                    {label}
                </Link>
            ))}
        </nav>
    )
}`} />

                <h2>useRouter</h2>
                <p>For programmatic navigation — redirecting after a form submit or async action — use <code>useRouter</code>. Because it accesses browser history, it must live inside a <code>"use client"</code> component:</p>
                <CodeBlock filename="app/components/LoginForm.tsx" code={`"use client"
import { useState } from 'react'
import { useRouter } from 'nukejs'

export default function LoginForm() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    async function handleSubmit() {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })

        if (res.ok) {
            router.push('/dashboard')       // adds to history
        } else {
            router.replace('/login?error=1') // replaces current entry
        }
    }

    return (
        <div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="button" onClick={handleSubmit}>Login</button>
        </div>
    )
}`} />

                <h3>router.back — programmatic back button</h3>
                <CodeBlock filename="app/components/BackButton.tsx" code={`"use client"
import { useRouter } from 'nukejs'

export default function BackButton() {
    const { back } = useRouter()
    return <button onClick={back}>← Go back</button>
}`} />

                <h3>router.refresh — re-render after a mutation</h3>
                <p>
                    <code>refresh()</code> re-triggers the current route without changing the
                    URL. Use it after a server mutation to fetch and display updated data:
                </p>
                <CodeBlock filename="app/components/DeleteButton.tsx" code={`"use client"
import { useRouter } from 'nukejs'

export default function DeleteButton({ postId }: { postId: string }) {
    const { refresh } = useRouter()

    async function handleDelete() {
        await fetch(\`/api/posts/\${postId}\`, { method: 'DELETE' })
        refresh() // re-renders the page so the deleted post disappears
    }

    return <button onClick={handleDelete}>Delete post</button>
}`} />

                <h2>router API</h2>
                <div className="doc-table-wrap">
                    <table className="doc-table">
                        <thead><tr><th>Property / Method</th><th>Description</th></tr></thead>
                        <tbody>
                            <tr><td><code>router.path</code></td><td>Current pathname (e.g. <code>/docs/routing</code>). Reactive — updates on every SPA navigation.</td></tr>
                            <tr><td><code>router.push(url)</code></td><td>Navigate to a URL, adds an entry to the history stack.</td></tr>
                            <tr><td><code>router.replace(url)</code></td><td>Navigate without adding to history (replaces current entry).</td></tr>
                            <tr><td><code>router.back()</code></td><td>Go back one step in history.</td></tr>
                            <tr><td><code>router.refresh()</code></td><td>Re-trigger the current route without a URL change — useful after a server mutation to reload page data.</td></tr>
                        </tbody>
                    </table>
                </div>

                <h2>Link props</h2>
                <div className="doc-table-wrap">
                    <table className="doc-table">
                        <thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
                        <tbody>
                            <tr><td><code>href</code></td><td><code>string</code></td><td>Destination URL.</td></tr>
                            <tr><td><code>children</code></td><td><code>React.ReactNode</code></td><td>Link content.</td></tr>
                            <tr><td><code>className</code></td><td><code>string</code> (optional)</td><td>CSS class(es) applied to the underlying <code>&lt;a&gt;</code> element.</td></tr>
                        </tbody>
                    </table>
                </div>

                <h2>External links</h2>
                <p>For external URLs use a plain <code>&lt;a&gt;</code> tag. NukeJS will not intercept it:</p>
                <CodeBlock code={`<a href="https://github.com/nuke-js/nukejs" target="_blank" rel="noopener">
    GitHub ↗
</a>`} />
            </div>
        </article>
    )
}