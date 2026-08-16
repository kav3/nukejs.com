import { useHtml } from "nukejs"
import CodeBlock from "../../../components/docs/CodeBlock"

export default function WebWorkersPage() {
    const title = "Web Workers"
    const subtitle = "Use Web Workers in NukeJS with the standard new URL(..., import.meta.url) pattern. The framework automatically bundles and serves worker scripts — no configuration needed."
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
                    NukeJS supports the standard <code>new URL(..., import.meta.url)</code> pattern for
                    creating Web Workers. At build time, the framework detects worker references, bundles
                    them separately, and rewrites the URL to point to the built asset. No webpack config,
                    no plugins — it just works.
                </p>

                <div className="doc-callout info">
                    <span className="doc-callout-icon">ℹ️</span>
                    <div className="doc-callout-body">
                        <strong>Client-side only</strong>{" "}
                        Web Workers run in the browser, not during SSR. Make sure your worker-using code
                        is in a <code>"use client"</code> component or guarded by a{" "}
                        <code>typeof window !== 'undefined'</code> check.
                    </div>
                </div>

                <h2>Basic usage</h2>
                <p>
                    Create a worker file with a <code>.worker.ts</code> extension (optional but
                    recommended for clarity), then instantiate it with the standard pattern:
                </p>

                <CodeBlock filename="app/workers/heavy-task.worker.ts" code={`// This file runs in a Web Worker context
self.addEventListener('message', (e) => {
    const { numbers } = e.data

    // Simulate expensive computation
    const sum = numbers.reduce((acc: number, n: number) => {
        for (let i = 0; i < 1000000; i++) {
            acc += Math.sqrt(n)
        }
        return acc
    }, 0)

    self.postMessage({ sum })
})`} />

                <CodeBlock filename="app/components/Calculator.tsx" code={`"use client"
import { useState } from 'react'

export default function Calculator() {
    const [result, setResult] = useState<number | null>(null)
    const [computing, setComputing] = useState(false)

    function compute() {
        setComputing(true)

        // Create worker using the standard URL pattern
        const worker = new Worker(
            new URL('../workers/heavy-task.worker.ts', import.meta.url),
            { type: 'module' }
        )

        worker.postMessage({ numbers: [1, 2, 3, 4, 5] })

        worker.addEventListener('message', (e) => {
            setResult(e.data.sum)
            setComputing(false)
            worker.terminate()
        })
    }

    return (
        <div>
            <button onClick={compute} disabled={computing}>
                {computing ? 'Computing...' : 'Run Heavy Task'}
            </button>
            {result !== null && <p>Result: {result}</p>}
        </div>
    )
}`} />

                <h2>How it works</h2>
                <ol>
                    <li><strong>Detection</strong> — During the build, esbuild scans your code for <code>new URL(..., import.meta.url)</code> patterns.</li>
                    <li><strong>Bundling</strong> — Each detected worker file is bundled separately as an ESM module with content-based hashing (<code>worker-[hash].js</code>).</li>
                    <li><strong>URL rewriting</strong> — The <code>new URL(...)</code> call is rewritten to point to <code>/__worker/worker-[hash].js</code> — a public URL served by the framework.</li>
                    <li><strong>Module workers</strong> — Workers are bundled as ES modules, so you can use <code>import</code> and modern syntax inside them.</li>
                </ol>

                <div className="doc-callout tip">
                    <span className="doc-callout-icon">💡</span>
                    <div className="doc-callout-body">
                        <strong>Content hashing</strong>{" "}
                        Worker URLs include a content hash, so changes to the worker source automatically
                        invalidate browser caches. You don't need to manually version worker scripts.
                    </div>
                </div>

                <h2>Example: Image processing</h2>
                <p>
                    Offload CPU-intensive image manipulation to a worker to keep the UI responsive:
                </p>

                <CodeBlock filename="app/workers/image-processor.worker.ts" code={`self.addEventListener('message', async (e) => {
    const { imageData, filter } = e.data

    const processed = applyFilter(imageData, filter)

    self.postMessage({ processed }, [processed.data.buffer])
})

function applyFilter(imageData: ImageData, filter: string): ImageData {
    const data = imageData.data
    const processed = new ImageData(
        new Uint8ClampedArray(data),
        imageData.width,
        imageData.height
    )

    for (let i = 0; i < data.length; i += 4) {
        switch (filter) {
            case 'grayscale':
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
                processed.data[i] = processed.data[i + 1] = processed.data[i + 2] = avg
                break
            case 'invert':
                processed.data[i] = 255 - data[i]
                processed.data[i + 1] = 255 - data[i + 1]
                processed.data[i + 2] = 255 - data[i + 2]
                break
        }
    }

    return processed
}`} />

                <CodeBlock filename="app/components/ImageEditor.tsx" code={`"use client"
import { useRef, useState } from 'react'

export default function ImageEditor() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [processing, setProcessing] = useState(false)

    async function applyFilter(filter: string) {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')!
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        setProcessing(true)

        const worker = new Worker(
            new URL('../workers/image-processor.worker.ts', import.meta.url),
            { type: 'module' }
        )

        worker.postMessage({ imageData, filter })

        worker.addEventListener('message', (e) => {
            ctx.putImageData(e.data.processed, 0, 0)
            setProcessing(false)
            worker.terminate()
        })
    }

    return (
        <div>
            <canvas ref={canvasRef} width={800} height={600} />
            <div>
                <button onClick={() => applyFilter('grayscale')} disabled={processing}>
                    Grayscale
                </button>
                <button onClick={() => applyFilter('invert')} disabled={processing}>
                    Invert
                </button>
            </div>
        </div>
    )
}`} />

                <h2>Example: Background data processing</h2>
                <p>
                    Parse and validate large datasets in a worker without blocking the main thread:
                </p>

                <CodeBlock filename="app/workers/csv-parser.worker.ts" code={`self.addEventListener('message', (e) => {
    const { csvText } = e.data

    const lines = csvText.split('\\n')
    const headers = lines[0].split(',')

    const rows = lines.slice(1).map((line: string) => {
        const values = line.split(',')
        return headers.reduce((obj: any, header: string, i: number) => {
            obj[header.trim()] = values[i]?.trim() ?? ''
            return obj
        }, {})
    })

    // Validate rows
    const valid = rows.filter((row: any) => row.email && row.name)
    const invalid = rows.length - valid.length

    self.postMessage({ valid, invalid, total: rows.length })
})`} />

                <CodeBlock filename="app/components/CSVImporter.tsx" code={`"use client"
import { useState } from 'react'

export default function CSVImporter() {
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)

        const csvText = await file.text()

        const worker = new Worker(
            new URL('../workers/csv-parser.worker.ts', import.meta.url),
            { type: 'module' }
        )

        worker.postMessage({ csvText })

        worker.addEventListener('message', (e) => {
            setResult(e.data)
            setLoading(false)
            worker.terminate()
        })
    }

    return (
        <div>
            <input type="file" accept=".csv" onChange={handleFile} />
            {loading && <p>Processing...</p>}
            {result && (
                <div>
                    <p>Total rows: {result.total}</p>
                    <p>Valid: {result.valid.length}</p>
                    <p>Invalid: {result.invalid}</p>
                </div>
            )}
        </div>
    )
}`} />

                <h2>Using dependencies in workers</h2>
                <p>
                    Workers are bundled with esbuild, so you can import npm packages just like in
                    regular components. The framework automatically includes dependencies in the
                    worker bundle:
                </p>

                <CodeBlock filename="app/workers/markdown.worker.ts" code={`import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

self.addEventListener('message', (e) => {
    const { markdown } = e.data

    // Parse markdown to HTML
    const rawHtml = marked(markdown)

    // Sanitize to prevent XSS
    const cleanHtml = DOMPurify.sanitize(rawHtml)

    self.postMessage({ html: cleanHtml })
})`} />

                <h2>Worker options</h2>
                <p>The <code>Worker</code> constructor accepts standard options:</p>

                <CodeBlock filename="app/components/Example.tsx" code={`const worker = new Worker(
    new URL('./task.worker.ts', import.meta.url),
    {
        type: 'module',        // Always use 'module' for NukeJS workers
        name: 'task-worker',   // Optional: appears in DevTools
        credentials: 'omit',   // Optional: fetch credentials mode
    }
)`} />

                <h2>Shared Workers</h2>
                <p>
                    The same pattern works for Shared Workers, which can be accessed from multiple
                    tabs or windows:
                </p>

                <CodeBlock filename="app/workers/sync.worker.ts" code={`const ports: MessagePort[] = []

self.addEventListener('connect', (e: any) => {
    const port = e.ports[0]
    ports.push(port)

    port.addEventListener('message', (e: any) => {
        // Broadcast to all connected tabs
        ports.forEach(p => {
            if (p !== port) p.postMessage(e.data)
        })
    })

    port.start()
})`} />

                <CodeBlock filename="app/components/SyncedComponent.tsx" code={`"use client"
import { useEffect, useState } from 'react'

export default function SyncedComponent() {
    const [count, setCount] = useState(0)

    useEffect(() => {
        const worker = new SharedWorker(
            new URL('../workers/sync.worker.ts', import.meta.url),
            { type: 'module' }
        )

        worker.port.addEventListener('message', (e) => {
            setCount(e.data.count)
        })

        worker.port.start()

        return () => worker.port.close()
    }, [])

    function increment() {
        setCount(c => c + 1)
        // Broadcast to other tabs via the shared worker
        const worker = new SharedWorker(
            new URL('../workers/sync.worker.ts', import.meta.url),
            { type: 'module' }
        )
        worker.port.postMessage({ count: count + 1 })
    }

    return <button onClick={increment}>Count: {count}</button>
}`} />

                <h2>Limitations</h2>
                <ul>
                    <li><strong>Client-only</strong> — Workers run in the browser. Make sure your code is in a <code>"use client"</code> component.</li>
                    <li><strong>Static specifiers only</strong> — The worker path must be a static string literal. Dynamic paths like <code>new URL(workerPath, import.meta.url)</code> are not supported.</li>
                    <li><strong>No DOM access</strong> — Workers run in a separate context without access to <code>window</code>, <code>document</code>, or React.</li>
                    <li><strong>Serialization overhead</strong> — Messages are cloned, not shared. Use Transferable objects (ArrayBuffer, MessagePort) for large data.</li>
                </ul>

                <div className="doc-callout tip">
                    <span className="doc-callout-icon">💡</span>
                    <div className="doc-callout-body">
                        <strong>Worker file naming</strong>{" "}
                        While not required, using <code>.worker.ts</code> or <code>.worker.js</code>
                        as a suffix makes it clear which files are worker entry points. This is purely
                        a convention — any <code>.ts</code> or <code>.js</code> file works.
                    </div>
                </div>

                <h2>TypeScript</h2>
                <p>
                    Enable worker types in your <code>tsconfig.json</code> to get full type checking
                    in worker files:
                </p>

                <CodeBlock filename="tsconfig.json" code={`{
    "compilerOptions": {
        "lib": ["ES2020", "DOM", "WebWorker"],
        // ... other options
    }
}`} />

                <CodeBlock filename="app/workers/typed.worker.ts" code={`// Strong typing for worker messages
interface InputMessage {
    type: 'compute'
    data: number[]
}

interface OutputMessage {
    type: 'result'
    sum: number
}

self.addEventListener('message', (e: MessageEvent<InputMessage>) => {
    const { data } = e.data
    const sum = data.reduce((a, b) => a + b, 0)

    const response: OutputMessage = { type: 'result', sum }
    self.postMessage(response)
})`} />
            </div>
        </article>
    )
}
