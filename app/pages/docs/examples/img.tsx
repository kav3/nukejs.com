import { useHtml } from "nukejs"
import CodeBlock from "../../../components/docs/CodeBlock"

export default function ImgSamplePage() {
    const title = "Img — Sample"
    const subtitle = "A runnable gallery using the built-in <Img> component: an eager hero banner, a blurred placeholder, and lazily-loaded photos."
    useHtml({ title })
    return (
        <article className="doc-article">
            <header className="doc-article-header">
                <h1 className="doc-article-title">{title}</h1>
                {subtitle && <p className="doc-article-subtitle">{subtitle}</p>}
            </header>

            <div className="doc-body">
                <div className="doc-integration-badge">Sample</div>

                <h2>Server component</h2>
                <p>
                    A page that mixes an eager above-the-fold hero with a grid of lazily-loaded photos and
                    one blurred placeholder. None of this needs a <code>"use client"</code> directive —
                    <code>&lt;Img&gt;</code> handles hydration internally.
                </p>
                <CodeBlock filename="app/pages/gallery.tsx" code={`import { Img } from 'nukejs'

const photos = [
    { src: '/photos/lake.jpg',        alt: 'Still lake at dusk' },
    { src: '/photos/forest.jpg',      alt: 'Pine forest in fog' },
    { src: '/photos/desert.jpg',      alt: 'Dunes at golden hour' },
    { src: '/photos/city.jpg',        alt: 'City skyline at night' },
]

export default function Gallery() {
    return (
        <main>
            {/* Above-the-fold: load immediately */}
            <Img
                src="/photos/hero.jpg"
                alt="Welcome to the gallery"
                width={1600}
                height={600}
                eager
                className="hero"
            />

            <h1>Gallery</h1>

            <div className="grid">
                {photos.map(p => (
                    <Img
                        key={p.src}
                        src={p.src}
                        alt={p.alt}
                        width={400}
                        height={300}
                        placeholder={\`\${p.src.replace('.jpg', '')}-tiny.jpg\`}
                    />
                ))}
            </div>
        </main>
    )
}`} />

                <h2>Default export only</h2>
                <p>
                    As with every page, this file exports a single default component. The component can be
                    <code>async</code> and fetch the photo list from a database — <code>&lt;Img&gt;</code>{" "}
                    works exactly the same in an async server component:
                </p>
                <CodeBlock filename="app/pages/gallery.tsx" code={`import { Img } from 'nukejs'

export default async function Gallery() {
    const photos = await db.photos.findMany()

    return (
        <div className="grid">
            {photos.map(p => (
                <Img key={p.id} src={p.url} alt={p.alt} width={400} height={300} />
            ))}
        </div>
    )
}`} />

                <h2>Styling notes</h2>
                <p>
                    Pass <code>className</code> and <code>style</code> like a normal <code>&lt;img&gt;</code>.
                    The internal blur transition is merged with your inline <code>style</code>, so don't set
                    <code>filter</code> or <code>opacity</code> directly unless you want to override the
                    placeholder fade.
                </p>
                <CodeBlock filename="app/public/gallery.css" code={`.hero { object-fit: cover; border-radius: 12px; }

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
}

.grid img { width: 100%; height: auto; border-radius: 8px; }`} />

                <div className="doc-callout tip">
                    <span className="doc-callout-icon">💡</span>
                    <div className="doc-callout-body">
                        <strong>Always set width &amp; height</strong>{" "}
                        Providing both reserves space in the document immediately, so lazy-loaded images
                        never cause layout shift when they swap in.
                    </div>
                </div>
            </div>
        </article>
    )
}
