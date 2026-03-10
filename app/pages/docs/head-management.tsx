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
                            <tr><td>script</td><td>object[]</td><td>Script tags. Supports <code>type</code>, <code>src</code>, and inline <code>children</code>.</td></tr>
                            <tr><td>htmlAttrs</td><td>object</td><td>Attributes set on <code>&lt;html&gt;</code> (e.g. <code>lang</code>).</td></tr>
                            <tr><td>bodyAttrs</td><td>object</td><td>Attributes set on <code>&lt;body&gt;</code>.</td></tr>
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