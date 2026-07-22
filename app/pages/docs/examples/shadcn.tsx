import { useHtml } from "nukejs"
import CodeBlock from "../../../components/docs/CodeBlock"

export default function ShadcnPage() {
    const title = "shadcn/ui"
    const subtitle = "Use shadcn/ui components in your NukeJS project. Because NukeJS doesn't use RSC, setup takes a few manual steps — but the CLI handles everything after that."
    useHtml({ title })
    const prev = { href: "/docs/examples/orpc", label: "oRPC" }
    const next = { href: "/docs/examples/tailwindcss", label: "Tailwind CSS" }
    return (
        <article className="doc-article">
            <header className="doc-article-header">
                <h1 className="doc-article-title">{title}</h1>
                {subtitle && <p className="doc-article-subtitle">{subtitle}</p>}
            </header>

            <div className="doc-body">
                <p>
                    shadcn/ui is a collection of accessible, composable components you copy
                    directly into your project. Since NukeJS doesn't use React Server
                    Components in the RSC sense, follow the{" "}
                    <a href="https://ui.shadcn.com/docs/installation/manual" target="_blank" rel="noopener noreferrer">
                        manual installation
                    </a>{" "}
                    path rather than a framework-specific preset.
                </p>

                <h2>1. Install Tailwind CSS</h2>
                <p>
                    shadcn/ui is styled with Tailwind CSS. If you haven't set it up yet, follow
                    the <a href="/docs/examples/tailwindcss">Tailwind CSS guide</a> first, then
                    come back here.
                </p>

                <h2>2. Install dependencies</h2>
                <CodeBlock language="bash" filename="terminal" code={`npm install shadcn class-variance-authority clsx tailwind-merge lucide-react tw-animate-css`} />

                <h2>3. Configure path aliases</h2>
                <p>
                    shadcn/ui uses <code>@/</code> path aliases. Add them to your{" "}
                    <code>tsconfig.json</code>:
                </p>
                <CodeBlock language="json" filename="tsconfig.json" code={`{
    "compilerOptions": {
        "baseUrl": ".",
        "paths": {
            "@/*": ["./*"]
        }
    }
}`} />

                <h2>4. Configure styles</h2>
                <p>
                    Add the shadcn CSS variables to your global stylesheet. In NukeJS, that
                    lives at <code>app/public/main.css</code>:
                </p>
                <CodeBlock filename="app/public/main.css" code={`@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --color-card: var(--card);
    --color-card-foreground: var(--card-foreground);
    --color-popover: var(--popover);
    --color-popover-foreground: var(--popover-foreground);
    --color-primary: var(--primary);
    --color-primary-foreground: var(--primary-foreground);
    --color-secondary: var(--secondary);
    --color-secondary-foreground: var(--secondary-foreground);
    --color-muted: var(--muted);
    --color-muted-foreground: var(--muted-foreground);
    --color-accent: var(--accent);
    --color-accent-foreground: var(--accent-foreground);
    --color-destructive: var(--destructive);
    --color-border: var(--border);
    --color-input: var(--input);
    --color-ring: var(--ring);
    --radius-sm: calc(var(--radius) * 0.6);
    --radius-md: calc(var(--radius) * 0.8);
    --radius-lg: var(--radius);
    --radius-xl: calc(var(--radius) * 1.4);
}

:root {
    --radius: 0.625rem;
    --background: oklch(1 0 0);
    --foreground: oklch(0.145 0 0);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.145 0 0);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.145 0 0);
    --primary: oklch(0.205 0 0);
    --primary-foreground: oklch(0.985 0 0);
    --secondary: oklch(0.97 0 0);
    --secondary-foreground: oklch(0.205 0 0);
    --muted: oklch(0.97 0 0);
    --muted-foreground: oklch(0.556 0 0);
    --accent: oklch(0.97 0 0);
    --accent-foreground: oklch(0.205 0 0);
    --destructive: oklch(0.577 0.245 27.325);
    --border: oklch(0.922 0 0);
    --input: oklch(0.922 0 0);
    --ring: oklch(0.708 0 0);
}

.dark {
    --background: oklch(0.145 0 0);
    --foreground: oklch(0.985 0 0);
    --card: oklch(0.205 0 0);
    --card-foreground: oklch(0.985 0 0);
    --primary: oklch(0.922 0 0);
    --primary-foreground: oklch(0.205 0 0);
    --secondary: oklch(0.269 0 0);
    --secondary-foreground: oklch(0.985 0 0);
    --muted: oklch(0.269 0 0);
    --muted-foreground: oklch(0.708 0 0);
    --accent: oklch(0.269 0 0);
    --accent-foreground: oklch(0.985 0 0);
    --destructive: oklch(0.704 0.191 22.216);
    --border: oklch(1 0 0 / 10%);
    --input: oklch(1 0 0 / 15%);
    --ring: oklch(0.556 0 0);
}

@layer base {
    * { @apply border-border outline-ring/50; }
    body { @apply bg-background text-foreground; }
}`} />

                <h2>5. Add the cn helper</h2>
                <CodeBlock filename="app/lib/utils.ts" code={`import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}`} />

                <h2>6. Create components.json</h2>
                <p>
                    Create a <code>components.json</code> at the project root. The aliases below
                    match the NukeJS project structure:
                </p>
                <CodeBlock language="json" filename="components.json" code={`{
    "$schema": "https://ui.shadcn.com/schema.json",
    "style": "radix-nova",
    "rsc": false,
    "tsx": true,
    "tailwind": {
        "config": "",
        "css": "app/public/main.css",
        "baseColor": "neutral",
        "cssVariables": true,
        "prefix": ""
    },
    "aliases": {
        "components": "@/app/components",
        "utils": "@/app/lib/utils",
        "ui": "@/app/components/ui",
        "lib": "@/app/lib",
        "hooks": "@/app/hooks"
    },
    "iconLibrary": "lucide"
}`} />
                <p>
                    Note <code>"rsc": false</code> — NukeJS doesn't use React Server
                    Components in the RSC sense, so this tells the CLI not to add{" "}
                    <code>"use client"</code> directives automatically (you'll add them
                    yourself where needed).
                </p>

                <h2>7. Add components with the CLI</h2>
                <p>
                    With <code>components.json</code> in place, the shadcn CLI can install
                    components directly into your project:
                </p>
                <CodeBlock language="bash" filename="terminal" code={`npx shadcn@latest add input
npx shadcn@latest add button
npx shadcn@latest add dialog`} />
                <p>
                    Components are copied into <code>app/components/ui/</code> — they're
                    plain TypeScript files you own and can edit freely.
                </p>

                <h2>8. Use in a client component</h2>
                <p>
                    shadcn components use React hooks internally, so any component that
                    imports them must be a <code>"use client"</code> component in NukeJS:
                </p>
                <CodeBlock filename="app/components/ContactForm.tsx" code={`"use client"
import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"

export default function ContactForm() {
    const [email, setEmail] = useState("")

    return (
        <form className="flex gap-2">
            <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />
            <Button type="submit">Subscribe</Button>
        </form>
    )
}`} />
                <p>
                    Then drop it into any server page — NukeJS will SSR the HTML and
                    hydrate only this component:
                </p>
                <CodeBlock filename="app/pages/index.tsx" code={`import ContactForm from "../components/ContactForm"

export default function Home() {
    return (
        <main>
            <h1>Stay in the loop</h1>
            <ContactForm />
        </main>
    )
}`} />

                <h2>Available components</h2>
                <p>
                    The full component catalogue — Button, Dialog, Select, Table, and
                    50+ more — is at{" "}
                    <a href="https://ui.shadcn.com/docs/components" target="_blank" rel="noopener noreferrer">
                        ui.shadcn.com/docs/components
                    </a>
                    . Each page includes copy-pasteable code and live previews.
                </p>

                <h2>Starter: shadcn/ui + i18n</h2>
                <p>
                    Building a multi-language project? <a href="https://github.com/unenterprise/i18n-shadcn-nukejs" target="_blank" rel="noopener noreferrer">
                        i18n-shadcn-nukejs
                    </a> is a starter with shadcn/ui and locale-based routing (see the{" "}
                    <a href="/docs/i18n">i18n guide</a>) already wired up:
                </p>
                <CodeBlock language="bash" filename="terminal" code={`npx degit unenterprise/i18n-shadcn-nukejs`} />
            </div>
        </article>
    )
}