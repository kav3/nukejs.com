import { useHtml } from "nukejs"
import CodeBlock from "../../components/docs/CodeBlock"

export default function HeadManagementPage() {
    const title = "useHtml()"
    const subtitle = "Control the document head from any component — titles, meta tags, Open Graph, canonical links, JSON-LD, and HTML attributes."
    useHtml({ title })
    return (
        <article className="doc-article">
            <header className="doc-article-header">
                <h1 className="doc-article-title">{title}</h1>
                <p className="doc-article-subtitle">{subtitle}</p>
            </header>

            <div className="doc-body">
                <h2>Basic usage</h2>
                <p>Call <code>useHtml()</code> from any server or client component. Calls in child components override calls in parent layouts for the same keys.</p>
                <CodeBlock filename="app/pages/about.tsx" code={`import { useHtml } from 'nukejs'

export default function About() {
    useHtml({
        title: 'About Us',

        meta: [
            { name: 'description', content: 'Learn about our team and mission.' },
            { property: 'og:title', content: 'About Us' },
            { property: 'og:description', content: 'Learn about our team.' },
            { property: 'og:image', content: 'https://mysite.com/og.png' },
            { name: 'twitter:card', content: 'summary_large_image' },
        ],

        link: [
            { rel: 'canonical', href: 'https://mysite.com/about' },
        ],

        htmlAttrs: { lang: 'en' },
        bodyAttrs: { className: 'page-about' },
    })

    return <main>...</main>
}`} />

                <h2>All options</h2>
                <div className="doc-table-wrap">
                    <table className="doc-table">
                        <thead><tr><th>Option</th><th>Type</th><th>Description</th></tr></thead>
                        <tbody>
                            <tr><td>title</td><td>string | (prev: string) =&gt; string</td><td>Page title. Pass a function to compose with layout titles.</td></tr>
                            <tr><td>meta</td><td>object[]</td><td>Each object becomes a <code>&lt;meta&gt;</code> element.</td></tr>
                            <tr><td>link</td><td>object[]</td><td>Each object becomes a <code>&lt;link&gt;</code> element.</td></tr>
                            <tr><td>script</td><td>object[]</td><td>Script tags. Supports <code>type</code>, <code>src</code>, inline <code>children</code>, and <code>position</code> (<code>"head"</code> | <code>"body"</code>).</td></tr>
                            <tr><td>style</td><td>object[]</td><td>Inline <code>&lt;style&gt;</code> blocks injected into <code>&lt;head&gt;</code>. Each entry accepts <code>content</code> (raw CSS) and an optional <code>media</code> attribute.</td></tr>
                            <tr><td>htmlAttrs</td><td>object</td><td>Attributes set on <code>&lt;html&gt;</code> (e.g. <code>lang</code>).</td></tr>
                            <tr><td>bodyAttrs</td><td>object</td><td>Attributes set on <code>&lt;body&gt;</code>.</td></tr>
                        </tbody>
                    </table>
                </div>

                <h2>Inline style injection</h2>
                <p>
                    The <code>style</code> option injects <code>&lt;style&gt;</code> blocks
                    into <code>&lt;head&gt;</code>. This is useful for critical CSS that must
                    be present before first paint, or for per-page styles that vary by route:
                </p>
                <CodeBlock filename="app/pages/dashboard.tsx" code={`import { useHtml } from 'nukejs'

export default function Dashboard() {
    useHtml({
        style: [
            { content: \`.chart { height: 400px; }\` },
            { content: \`.sidebar { width: 260px; }\`, media: '(min-width: 768px)' },
        ],
    })

    return <main>...</main>
}`} />
                <div className="doc-table-wrap">
                    <table className="doc-table">
                        <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                        <tbody>
                            <tr><td><code>content</code></td><td><code>string</code></td><td>Raw CSS injected inside a <code>&lt;style&gt;</code> tag.</td></tr>
                            <tr><td><code>media</code></td><td><code>string</code> (optional)</td><td>Value for the <code>media</code> attribute — e.g. <code>'print'</code>, <code>'(prefers-color-scheme: dark)'</code>.</td></tr>
                        </tbody>
                    </table>
                </div>

                <h2>Title composition across layouts</h2>
                <CodeBlock filename="app/pages/layout.tsx" code={`// Root layout: wraps every page title
useHtml({ title: (prev) => \`\${prev} | My Site\` })`} />
                <CodeBlock filename="app/pages/about.tsx" code={`// Page sets the base title
useHtml({ title: 'About Us' })
// Result: "About Us | My Site"`} />
                <p>The page title is always the base. Layout functions wrap it outward, from innermost to outermost layout.</p>

                <h2>Inline scripts</h2>
                <p>Pass <code>children</code> in a script entry for inline JavaScript. Use <code>src</code> for external scripts:</p>
                <CodeBlock filename="app/pages/layout.tsx" code={`useHtml({
    script: [
        // External async script
        { src: 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXX', type: 'text/javascript' },
        // Inline init script
        { type: 'text/javascript', children: \`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXX');
        \` },
    ]
})`} />

                <h2>Script position: head vs body</h2>
                <p>
                    Each script entry accepts a <code>position</code> field that controls where it is injected in the HTML document.
                </p>
                <div className="doc-table-wrap">
                    <table className="doc-table">
                        <thead><tr><th>position</th><th>Where it lands</th><th>When to use</th></tr></thead>
                        <tbody>
                            <tr><td><code>"head"</code> (default)</td><td>Inside <code>&lt;head&gt;</code></td><td>Theme detection, critical inline scripts that must run before first paint.</td></tr>
                            <tr><td><code>"body"</code></td><td>End of <code>&lt;body&gt;</code></td><td>Analytics, tracking pixels, and third-party loaders that should not block rendering.</td></tr>
                        </tbody>
                    </table>
                </div>
                <CodeBlock filename="app/pages/layout.tsx" code={`useHtml({
    script: [
        // Analytics loader — injected at end of <body>, won't block rendering
        {
            src: 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX',
            async: true,
            position: 'body',
        },
        // Inline init — also deferred to body, must follow the loader above
        {
            children: \`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-XXXXXXXXXX');
            \`,
            position: 'body',
        },
        // Theme detection — must run before first paint, stays in <head>
        {
            children: \`
                const t = localStorage.getItem('theme') ?? 'light';
                document.documentElement.classList.add(t);
            \`,
            // position defaults to 'head'
        },
    ]
})`} />

                <h2>Inline JSON-LD structured data</h2>
                <CodeBlock filename="app/pages/index.tsx" code={`const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NukeJS',
    url: 'https://nukejs.com',
    applicationCategory: 'DeveloperApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

useHtml({
    title: 'NukeJS',
    script: [
        { type: 'application/ld+json', children: JSON.stringify(jsonLd) }
    ]
})`} />

                <h2>Setting defaults in the root layout</h2>
                <p>Set base values once in <code>app/pages/layout.tsx</code>. Individual pages only override what differs:</p>
                <CodeBlock filename="app/pages/layout.tsx" code={`import { useHtml } from 'nukejs'

const SITE = 'https://mysite.com'

export default function RootLayout({ children }: { children: React.ReactNode }) {
    useHtml({
        title: (t) => \`\${t} | Acme Corp\`,
        meta: [
            { name: 'description', content: 'The default site description.' },
            { property: 'og:site_name', content: 'Acme Corp' },
            { property: 'og:image', content: \`\${SITE}/og-default.png\` },
            { name: 'twitter:card', content: 'summary_large_image' },
        ],
        htmlAttrs: { lang: 'en' },
    })
    return <>{children}</>
}`} />
            </div>
        </article>
    )
}