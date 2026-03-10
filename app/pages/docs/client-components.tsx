import { useHtml } from "nukejs"
import CodeBlock from "../../components/docs/CodeBlock"

export default function ClientComponentsPage() {
    const title = "Client Components"
    const subtitle = 'Add "use client" to any component to opt it into the browser bundle. Everything else is server-only by default.'
    useHtml({ title })
    return (
        <article className="doc-article">
            <header className="doc-article-header">
                <h1 className="doc-article-title">{title}</h1>
                <p className="doc-article-subtitle">{subtitle}</p>
            </header>

            <div className="doc-body">
                <h2>Server components by default</h2>
                <p>
                    Every component in NukeJS is a server component by default. It runs once on the server,
                    its output becomes HTML, and <strong>zero JavaScript is sent to the browser</strong> for it.
                    You can use <code>async/await</code>, import server-only packages, read environment
                    variables — it all stays on the server.
                </p>

                <h2>Opting in with "use client"</h2>
                <p>Add <code>"use client"</code> as the very first line to make a component interactive:</p>
                <CodeBlock filename="app/components/Counter.tsx" code={`"use client"
import { useState } from 'react'

export default function Counter({ initial = 0 }: { initial?: number }) {
    const [count, setCount] = useState(initial)

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(c => c + 1)}>+</button>
            <button onClick={() => setCount(c => c - 1)}>−</button>
        </div>
    )
}`} />
                <p>Use it from a server component — NukeJS handles bundling and hydration automatically:</p>
                <CodeBlock filename="app/pages/index.tsx" code={`import Counter from '../components/Counter'

export default async function Home() {
    const initialCount = await db.getCount() // server-only

    return (
        <main>
            <h1>Counter demo</h1>
            <Counter initial={initialCount} />  {/* hydrated in browser */}
        </main>
    )
}`} />

                <h2>What NukeJS does under the hood</h2>
                <div className="doc-steps">
                    <div className="doc-step">
                        <span className="doc-step-num">1</span>
                        <div className="doc-step-body"><p>Bundles the file and serves it at <code>/__client-component/{'<id>'}.js</code></p></div>
                    </div>
                    <div className="doc-step">
                        <span className="doc-step-num">2</span>
                        <div className="doc-step-body"><p>During SSR, emits a <code>{'<span data-hydrate-id="…">'}</code> placeholder with serialized props</p></div>
                    </div>
                    <div className="doc-step">
                        <span className="doc-step-num">3</span>
                        <div className="doc-step-body"><p>In the browser, the NukeJS runtime fetches the bundle and mounts the component with React</p></div>
                    </div>
                </div>

                <h2>Passing children from server to client</h2>
                <p>You can pass JSX from a server component into a client component. NukeJS serializes the tree and reconstructs it in the browser before mounting:</p>
                <CodeBlock filename="app/components/Dialog.tsx" code={`"use client"
import { useState } from 'react'

export default function Dialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <button onClick={() => setOpen(true)}>Open</button>
            {open && (
                <dialog open>
                    <div>{children}</div>  {/* server-rendered content, reconstructed */}
                    <button onClick={() => setOpen(false)}>Close</button>
                </dialog>
            )}
        </>
    )
}`} />
                <CodeBlock filename="app/pages/index.tsx" code={`import Dialog from '../components/Dialog'

export default async function Home() {
    const terms = await fetchTermsOfService() // server fetch

    return (
        <Dialog>
            <h2>Terms of Service</h2>
            <p>{terms.text}</p>  {/* server data inside a client component */}
        </Dialog>
    )
}`} />

                <h2>Rules</h2>
                <ul>
                    <li><code>"use client"</code> must be the <strong>first non-comment line</strong> of the file</li>
                    <li>The component must have a <strong>named default export</strong> — NukeJS uses the function name during hydration</li>
                    <li>Props must be <strong>JSON-serializable</strong> — no functions, no class instances, no Dates</li>
                    <li>React elements (children, slots) <em>are</em> supported — NukeJS serializes and reconstructs them</li>
                </ul>

                <div className="doc-callout tip">
                    <span className="doc-callout-icon">✅</span>
                    <div className="doc-callout-body">
                        <strong>Keep client components lean</strong>{" "}
                        The smaller a client component, the smaller its bundle. Move data fetching and static
                        markup into server components and pass results down as props.
                    </div>
                </div>
            </div>
        </article>
    )
}