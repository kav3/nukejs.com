import { useHtml } from "nukejs"
import CodeBlock from "../../../components/docs/CodeBlock"

export default function RenderComponentPage() {
    const title = "RenderComponent"
    const subtitle = "Use renderComponent() to server-render React components outside the page router — for emails, PDFs, API responses, scheduled jobs, or any context where you need HTML without a full HTTP request/response cycle."
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
                    <code>renderComponent()</code> is a server-only function that renders any React component
                    to an HTML string with full SSR support — hooks, async components, layouts, and all.
                    Unlike the page router (which ties rendering to HTTP routes), <code>renderComponent()</code>
                    runs standalone: call it from API routes, cron jobs, CLI scripts, or anywhere you need
                    server-rendered markup programmatically.
                </p>

                <div className="doc-callout info">
                    <span className="doc-callout-icon">ℹ️</span>
                    <div className="doc-callout-body">
                        <strong>Import from 'nukejs/server'</strong>{" "}
                        <code>renderComponent</code> is a server-only API. Import it from{" "}
                        <code>'nukejs/server'</code>, not <code>'nukejs'</code>, to avoid pulling
                        Node.js built-ins into client bundles.
                    </div>
                </div>

                <h2>Basic usage</h2>
                <CodeBlock filename="scripts/generate-email.ts" code={`import { renderComponent } from 'nukejs/server'
import WelcomeEmail from '../app/emails/Welcome'

const html = await renderComponent(WelcomeEmail, {
    name: 'Alice',
    activationLink: 'https://example.com/activate?token=xyz'
})

console.log(html) // Full HTML document string`} />

                <h2>Signature</h2>
                <CodeBlock code={`renderComponent(
    Component: React.ComponentType<any>,
    props?: Record<string, any>,
    options?: RenderComponentOptions
): Promise<string>`} />

                <h3>Options</h3>
                <div className="doc-table-wrap">
                    <table className="doc-table">
                        <thead><tr><th>Option</th><th>Type</th><th>Description</th></tr></thead>
                        <tbody>
                            <tr>
                                <td>layouts</td>
                                <td>React.ComponentType[]</td>
                                <td>Array of layout components to wrap the main component. Applied innermost-first.</td>
                            </tr>
                            <tr>
                                <td>url</td>
                                <td>string</td>
                                <td>URL pathname for the request context (default: <code>'/'</code>). Used by <code>useRequest()</code>.</td>
                            </tr>
                            <tr>
                                <td>params</td>
                                <td>Record&lt;string, string | string[]&gt;</td>
                                <td>Route params exposed via <code>useRequest().params</code></td>
                            </tr>
                            <tr>
                                <td>query</td>
                                <td>Record&lt;string, string | string[]&gt;</td>
                                <td>Query string params exposed via <code>useRequest().query</code></td>
                            </tr>
                            <tr>
                                <td>headers</td>
                                <td>Record&lt;string, string&gt;</td>
                                <td>Request headers exposed via <code>useRequest().headers</code></td>
                            </tr>
                            <tr>
                                <td>title</td>
                                <td>string</td>
                                <td>Default document title (default: <code>'NukeJS'</code>)</td>
                            </tr>
                            <tr>
                                <td>isDev</td>
                                <td>boolean</td>
                                <td>Development mode flag. Auto-detected from <code>NODE_ENV</code> if not set.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h2>Example: Email templates</h2>
                <p>
                    Render transactional email HTML using React components. Share styles and layout
                    components across all your emails.
                </p>

                <CodeBlock filename="app/emails/Welcome.tsx" code={`import { useHtml } from 'nukejs'

export default function WelcomeEmail({ name, activationLink }: {
    name: string
    activationLink: string
}) {
    useHtml({ title: 'Welcome!' })

    return (
        <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
            <h1>Welcome, {name}!</h1>
            <p>Thank you for signing up. Please activate your account:</p>
            <a
                href={activationLink}
                style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    background: '#0070f3',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px'
                }}
            >
                Activate Account
            </a>
            <p style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                If you didn't sign up, ignore this email.
            </p>
        </div>
    )
}`} />

                <CodeBlock filename="lib/email.ts" code={`import { renderComponent } from 'nukejs/server'
import nodemailer from 'nodemailer'
import WelcomeEmail from '../app/emails/Welcome'

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

export async function sendWelcomeEmail(to: string, name: string, token: string) {
    const activationLink = \`https://example.com/activate?token=\${token}\`

    const html = await renderComponent(WelcomeEmail, {
        name,
        activationLink
    })

    await transporter.sendMail({
        from: 'noreply@example.com',
        to,
        subject: 'Welcome to Our App',
        html,
    })
}`} />

                <h2>Example: PDF generation</h2>
                <p>
                    Combine <code>renderComponent()</code> with a headless browser to generate PDFs
                    from React components:
                </p>

                <CodeBlock filename="app/templates/Invoice.tsx" code={`export default function InvoiceTemplate({ invoice }: { invoice: any }) {
    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Invoice #{invoice.number}</h1>
            <p>Date: {new Date(invoice.date).toLocaleDateString()}</p>
            <hr />
            <h2>Items</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #000' }}>
                        <th style={{ textAlign: 'left' }}>Description</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.items.map((item: any, i: number) => (
                        <tr key={i}>
                            <td>{item.description}</td>
                            <td style={{ textAlign: 'right' }}>\${item.amount.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <hr />
            <p style={{ textAlign: 'right', fontSize: '18px', fontWeight: 'bold' }}>
                Total: \${invoice.total.toFixed(2)}
            </p>
        </div>
    )
}`} />

                <CodeBlock filename="lib/pdf.ts" code={`import { renderComponent } from 'nukejs/server'
import puppeteer from 'puppeteer'
import InvoiceTemplate from '../app/templates/Invoice'

export async function generateInvoicePDF(invoice: any): Promise<Buffer> {
    // Render component to HTML
    const html = await renderComponent(InvoiceTemplate, { invoice })

    // Launch headless browser
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    // Generate PDF
    const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
    })

    await browser.close()
    return pdf
}`} />

                <h2>Example: API route returning HTML</h2>
                <p>
                    Render dynamic HTML responses in API routes without going through the page router:
                </p>

                <CodeBlock filename="server/preview/[id].ts" code={`import type { IncomingMessage, ServerResponse } from 'http'
import { renderComponent } from 'nukejs/server'
import BlogPost from '../../app/components/BlogPost'
import { getPostById } from '../../lib/db'

export async function GET(
    req: IncomingMessage & { params: any },
    res: ServerResponse
) {
    const postId = parseInt(req.params.id as string)
    const post = await getPostById(postId)

    if (!post) {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('Not found')
        return
    }

    // Render the component with custom headers
    const html = await renderComponent(BlogPost,
        { post },
        {
            url: \`/preview/\${postId}\`,
            headers: { 'x-preview': 'true' },
            title: post.title,
        }
    )

    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(html)
}`} />

                <h2>Using layouts</h2>
                <p>
                    Wrap your component in one or more layout components to share structure, styles,
                    or context providers:
                </p>

                <CodeBlock filename="app/layouts/EmailLayout.tsx" code={`export default function EmailLayout({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <head>
                <meta charSet="utf-8" />
                <style>{\`
                    body {
                        margin: 0;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    }
                \`}</style>
            </head>
            <body>
                <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
                    {children}
                </div>
            </body>
        </html>
    )
}`} />

                <CodeBlock filename="scripts/send-newsletter.ts" code={`import { renderComponent } from 'nukejs/server'
import EmailLayout from '../app/layouts/EmailLayout'
import Newsletter from '../app/emails/Newsletter'

const html = await renderComponent(
    Newsletter,
    { articles: latestArticles },
    {
        layouts: [EmailLayout],  // Wraps Newsletter in EmailLayout
        title: 'Weekly Newsletter'
    }
)

// html is a complete <!DOCTYPE html> document with the layout applied`} />

                <h2>Request context with useRequest()</h2>
                <p>
                    Components rendered via <code>renderComponent()</code> can use <code>useRequest()</code>
                    to access the synthetic request context you provide:
                </p>

                <CodeBlock filename="app/components/Report.tsx" code={`import { useRequest } from 'nukejs'

export default function Report() {
    const { query, headers } = useRequest()

    const format = query.format as string ?? 'summary'  // From options.query
    const locale = headers['accept-language'] ?? 'en'   // From options.headers

    return (
        <div>
            <p>Report format: {format}</p>
            <p>Locale: {locale}</p>
        </div>
    )
}`} />

                <CodeBlock filename="scripts/generate-report.ts" code={`import { renderComponent } from 'nukejs/server'
import Report from '../app/components/Report'

const html = await renderComponent(Report, {}, {
    url: '/reports/monthly',
    query: { format: 'detailed' },
    headers: { 'accept-language': 'fr-FR' },
})

// The Report component sees query.format === 'detailed'
// and headers['accept-language'] === 'fr-FR'`} />

                <h2>When to use renderComponent()</h2>
                <div className="doc-table-wrap">
                    <table className="doc-table">
                        <thead><tr><th>Use case</th><th>Why</th></tr></thead>
                        <tbody>
                            <tr>
                                <td>Email templates</td>
                                <td>Reuse React components for transactional and marketing emails</td>
                            </tr>
                            <tr>
                                <td>PDF generation</td>
                                <td>Render invoices, reports, certificates as HTML → PDF</td>
                            </tr>
                            <tr>
                                <td>API routes returning HTML</td>
                                <td>Preview endpoints, embeds, or dynamic snippets</td>
                            </tr>
                            <tr>
                                <td>Static site generation</td>
                                <td>Pre-render pages in a build script</td>
                            </tr>
                            <tr>
                                <td>Scheduled jobs</td>
                                <td>Generate and send HTML summaries on a cron schedule</td>
                            </tr>
                            <tr>
                                <td>Testing</td>
                                <td>Render components in tests to verify output</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="doc-callout warning">
                    <span className="doc-callout-icon">⚠️</span>
                    <div className="doc-callout-body">
                        <strong>No client-side hydration</strong>{" "}
                        HTML generated by <code>renderComponent()</code> is pure SSR output. It does not
                        include the hydration script or client bundle. If you need interactive components,
                        use the page router instead.
                    </div>
                </div>

                <h2>TypeScript</h2>
                <CodeBlock filename="lib/render.ts" code={`import { renderComponent } from 'nukejs/server'
import type { RenderComponentOptions } from 'nukejs/server'

// Type-safe options
const options: RenderComponentOptions = {
    url: '/foo',
    query: { bar: 'baz' },
    headers: { 'x-custom': 'value' },
}

const html = await renderComponent(MyComponent, { prop: 'value' }, options)`} />
            </div>
        </article>
    )
}
