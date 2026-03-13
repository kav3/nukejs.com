import { useHtml } from "nukejs"
import CodeBlock from "../../../components/docs/CodeBlock"

export default function TailwindCSSPage() {
    const title = "Tailwind CSS"
    const subtitle = "Add Tailwind CSS to a NukeJS project. Because NukeJS controls the HTML pipeline you run Tailwind as a CLI watcher alongside the dev server."
    useHtml({ title })
    const prev = { href: "/docs/examples/prisma", label: "Prisma" }
    const next = { href: "/docs/examples/mongoose", label: "Mongoose" }
    return (
        <article className="doc-article">
            <header className="doc-article-header">
                <h1 className="doc-article-title">{title}</h1>
                {subtitle && <p className="doc-article-subtitle">{subtitle}</p>}
            </header>

            <div className="doc-body">
                <div className="doc-callout warning">
                    <span className="doc-callout-icon">⚠️</span>
                    <div className="doc-callout-body">
                        <strong>No plugins</strong>
                        <p>NukeJS intentionally avoids using magic plugins to add features. It keeps everything minimal and simple so it’s easy for everyone to understand.</p>
                    </div>
                </div>

                <div className="doc-integration-badge">Integration</div>

                <h2>Install</h2>
                <CodeBlock language="bash" filename="terminal" code={`npm install -D tailwindcss @tailwindcss/cli`} />

                <h2>Create the CSS entry file</h2>
                <p>Tailwind v4 uses a CSS-first approach. Create a single file at the project root that imports the framework and adds any global base styles:</p>
                <CodeBlock language="css" filename="global.css" code={`@import "tailwindcss";

body {
    @apply bg-blue-500;
}`} />
                <p>The Tailwind CLI reads this file, scans your TSX for class names, and writes the compiled output to <code>app/public/styles.css</code>. Never edit <code>styles.css</code> by hand — it is regenerated on every build.</p>

                <h2>Start the watcher with middleware</h2>
                <p>NukeJS loads <code>middleware.ts</code> before every request. Spawn the Tailwind CLI watcher there in development so it runs inside the same <code>nuke dev</code> process — no second terminal required:</p>
                <CodeBlock filename="middleware.ts" code={`import { spawn } from 'child_process'
import type { IncomingMessage, ServerResponse } from 'http'

if (process.env.ENVIRONMENT !== 'production') {
    spawn(
        'npx',
        ['@tailwindcss/cli', '-i', './global.css', '-o', './app/public/styles.css', '--watch'],
        { stdio: 'inherit', shell: true }
    )
}

export default async function middleware(req: IncomingMessage, res: ServerResponse) {
    // your existing middleware logic
}`} />
                <p>The <code>ENVIRONMENT !== 'production'</code> guard ensures the watcher only runs locally. In production the CSS is compiled by the <code>build</code> script before NukeJS bundles the app.</p>

                <h2>Update package.json</h2>
                <p>Add a <code>build</code> script that compiles Tailwind first, then hands off to NukeJS:</p>
                <CodeBlock filename="package.json" code={`{
    "scripts": {
        "dev": "nuke dev",
        "build": "npx @tailwindcss/cli -i ./global.css -o ./app/public/styles.css && nuke build"
    },
    "devDependencies": {
        "@tailwindcss/cli": "^4.2.1",
        "tailwindcss": "^4.2.1"
    }
}`} />

                <h2>Load the stylesheet in your layout</h2>
                <p>NukeJS serves everything in <code>app/public/</code> as static files, so <code>/styles.css</code> resolves directly to the compiled output. Inject it into every page via the root layout:</p>
                <CodeBlock filename="app/pages/layout.tsx" code={`import { useHtml } from "nukejs"
import React from "react"

export default function Layout({ children }: { children: React.ReactNode }) {
    useHtml({
        link: [{ rel: 'stylesheet', href: '/styles.css' }],
    })
    return <>{children}</>
}`} />

                <h2>Use Tailwind classes</h2>
                <p>With the layout in place, use any Tailwind utility class in your page components:</p>
                <CodeBlock filename="app/pages/index.tsx" code={`import { useHtml } from "nukejs"

export default function Index() {
    useHtml({
        bodyAttrs: {
            style: "margin:0;height:100vh;display:flex;justify-content:center;align-items:center;"
        }
    })

    return (
        <div className="flex flex-col items-center gap-4 text-center px-6">
            <img src="/nuke.png" alt="NukeJS logo" className="w-24 h-24" />
            <h2 className="text-3xl font-bold tracking-tight text-white">
                Welcome to NukeJS
            </h2>
            <p className="text-slate-300 max-w-sm text-sm leading-relaxed">
                React. Weaponized. — now with utility-first styling.
            </p>
            <a
                href="/docs"
                className="mt-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm font-medium text-white"
            >
                Read the docs →
            </a>
        </div>
    )
}`} />

                <h2>Tailwind with a client component</h2>
                <p>Client components use Tailwind classes exactly the same way — as long as the CSS is loaded in the layout, it applies everywhere:</p>
                <CodeBlock filename="app/components/ThemeToggle.tsx" code={`"use client"
import { useState } from 'react'

export default function ThemeToggle() {
    const [dark, setDark] = useState(true)

    return (
        <button
            onClick={() => setDark(d => !d)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-sm text-slate-200 hover:border-indigo-500 transition-colors"
        >
            <span>{dark ? '🌙' : '☀️'}</span>
            {dark ? 'Dark mode' : 'Light mode'}
        </button>
    )
}`} />

                <div className="doc-callout tip">
                    <span className="doc-callout-icon">✅</span>
                    <div className="doc-callout-body">
                        <strong>Use Tailwind v4 — it's config-free</strong>
                        <p>Tailwind v4 eliminates <code>tailwind.config.js</code> entirely. Theme tokens, custom utilities, and source paths all live in your CSS entry file via <code>@theme</code>, <code>@utility</code>, and <code>@source</code> directives.</p>
                    </div>
                </div>
            </div>
        </article>
    )
}