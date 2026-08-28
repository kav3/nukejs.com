import { useHtml, Link } from "nukejs"
import CodeBlock from "../../components/docs/CodeBlock"

export default function ImgPage() {
    const title = "Img Component & Lazy Loading"
    const subtitle = "Use the built-in <Img> component to keep images from blocking initial render. It ships a real <img> tag on the server and lazily swaps in the real source once it nears the viewport — no 'use client' needed in your own file."
    useHtml({ title })
    return (
        <article className="doc-article">
            <header className="doc-article-header">
                <h1 className="doc-article-title">{title}</h1>
                {subtitle && <p className="doc-article-subtitle">{subtitle}</p>}
            </header>

            <div className="doc-body">
                <div className="doc-integration-badge">Core Component</div>

                <h2>Overview</h2>
                <p>
                    Use the built-in <code>&lt;Img&gt;</code> component for images that shouldn't block
                    initial render. It's a <code>"use client"</code> boundary internally, but you can drop
                    it into a server component like any other tag — no <code>"use client"</code> directive
                    needed in your own file.
                </p>

                <CodeBlock filename="app/pages/gallery.tsx" code={`import { Img } from 'nukejs'

export default function Gallery() {
    return (
        <Img
            src="/photos/mountain.jpg"
            alt="Mountain at sunrise"
            width={800}
            height={450}
        />
    )
}`} />

                <div className="doc-callout info">
                    <span className="doc-callout-icon">ℹ️</span>
                    <div className="doc-callout-body">
                        <strong>No layout shift</strong>{" "}
                        On the server, <code>&lt;Img&gt;</code> renders a real <code>&lt;img&gt;</code> tag
                        immediately — <code>width</code>/<code>height</code> reserve the space so there's no
                        jump when the real image loads, and nothing needs to hydrate in later that could flash
                        missing content.
                    </div>
                </div>

                <h2>How it works</h2>
                <p>
                    In the browser, the component doesn't set <code>src</code> to the real image right away.
                    Instead it watches itself with <code>IntersectionObserver</code> and only swaps in the
                    real <code>src</code> once the element is about to enter the viewport (controlled by{" "}
                    <code>rootMargin</code>, 200px by default). Until then it shows <code>placeholder</code>{" "}
                    if you gave it one, or just waits.
                </p>
                <p>
                    Browsers that don't support <code>IntersectionObserver</code>, and the initial server
                    render, always get the real image — the component never hides content it can't guarantee
                    it'll lazily reveal later.
                </p>

                <h2>Blurred placeholders</h2>
                <p>
                    Pass a small/blurred <code>placeholder</code> image and <code>&lt;Img&gt;</code> will show
                    it (with a CSS blur) until the real image finishes loading, then cross-fade:
                </p>
                <CodeBlock filename="app/pages/gallery.tsx" code={`<Img
    src="/photos/mountain-full.jpg"
    placeholder="/photos/mountain-tiny.jpg"
    alt="Mountain at sunrise"
    width={800}
    height={450}
/>`} />

                <h2>Loading images eagerly</h2>
                <p>
                    Lazy loading is wasted (and can even hurt LCP) on above-the-fold images like a hero
                    banner. Set <code>eager</code> to skip the <code>IntersectionObserver</code> step and
                    load immediately:
                </p>
                <CodeBlock filename="app/pages/home.tsx" code={`<Img src="/hero.jpg" alt="Welcome" width={1600} height={600} eager />`} />

                <h2>Props</h2>
                <div className="doc-table-wrap">
                    <table className="doc-table">
                        <thead>
                            <tr><th>Prop</th><th>Type</th><th>Description</th></tr>
                        </thead>
                        <tbody>
                            <tr><td><code>src</code></td><td><code>string</code></td><td>Image URL — swapped in once the image is near the viewport</td></tr>
                            <tr><td><code>alt</code></td><td><code>string</code></td><td>Alt text (required)</td></tr>
                            <tr><td><code>width</code></td><td><code>number | string</code></td><td>Rendered width — set alongside <code>height</code> to prevent layout shift</td></tr>
                            <tr><td><code>height</code></td><td><code>number | string</code></td><td>Rendered height</td></tr>
                            <tr><td><code>placeholder</code></td><td><code>string</code></td><td>Low-res/blurred image shown until <code>src</code> loads</td></tr>
                            <tr><td><code>rootMargin</code></td><td><code>string</code></td><td>How far ahead of the viewport to start loading — passed straight to <code>IntersectionObserver</code>. Default <code>"200px"</code></td></tr>
                            <tr><td><code>eager</code></td><td><code>boolean</code></td><td>Skip lazy-loading and load <code>src</code> immediately. Use for above-the-fold images</td></tr>
                            <tr><td><code>className</code></td><td><code>string</code></td><td>CSS class(es) applied to the underlying <code>&lt;img&gt;</code></td></tr>
                            <tr><td><code>style</code></td><td><code>React.CSSProperties</code></td><td>Inline styles merged with the blur transition NukeJS applies internally</td></tr>
                            <tr><td><code>onLoad</code></td><td><code>(e) =&gt; void</code></td><td>Fired when the real image finishes loading</td></tr>
                            <tr><td><code>onError</code></td><td><code>(e) =&gt; void</code></td><td>Fired if the image fails to load</td></tr>
                        </tbody>
                    </table>
                </div>

                <h2>Sample</h2>
                <p>
                    See a runnable example with a full gallery, blurred placeholder, and eager hero image on
                    the <Link href="/docs/examples/img">Img sample page</Link>.
                </p>
            </div>
        </article>
    )
}
