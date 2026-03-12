import { useHtml } from "nukejs"
import CodeBlock from "../../../components/docs/CodeBlock"

export default function PrismaPage() {
    const title = "Prisma"
    const subtitle = "Use Prisma ORM for type-safe database access. Because NukeJS pages and API routes run on the server, Prisma works exactly as you'd expect."
    useHtml({ title })
    const prev = { href: "/docs/examples/tailwindcss", label: "Tailwind CSS" }
    const next = { href: "/docs/examples/mongoose", label: "Mongoose" }
    return (
        <article className="doc-article">
            <header className="doc-article-header">
                <h1 className="doc-article-title">{title}</h1>
                {subtitle && <p className="doc-article-subtitle">{subtitle}</p>}
            </header>

            <div className="doc-body">
                <div className="doc-integration-badge">Integration</div>

                <h2>Install</h2>
                <CodeBlock language="bash" filename="terminal" code={`npm install prisma @prisma/client
npx prisma init`} />
                <p><code>prisma init</code> creates a <code>prisma/schema.prisma</code> file and a <code>.env</code> with a <code>DATABASE_URL</code> placeholder.</p>

                <h2>Define your schema</h2>
                <CodeBlock filename="prisma/schema.prisma" code={`generator client {
    provider = "prisma-client-js"
}

datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
}

model User {
    id        Int      @id @default(autoincrement())
    email     String   @unique
    name      String?
    createdAt DateTime @default(now())
    posts     Post[]
}

model Post {
    id        Int      @id @default(autoincrement())
    title     String
    content   String
    published Boolean  @default(false)
    author    User     @relation(fields: [authorId], references: [id])
    authorId  Int
    createdAt DateTime @default(now())
}`} />

                <h2>Generate the client and migrate</h2>
                <CodeBlock language="bash" filename="terminal" code={`npx prisma migrate dev --name init
npx prisma generate`} />

                <h2>Create a singleton client</h2>
                <p>In development, hot reloading can create multiple Prisma Client instances. A singleton pattern prevents this:</p>
                <CodeBlock filename="lib/db.ts" code={`import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({ log: ['query'] })

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}`} />

                <h2>Query from a server page</h2>
                <p>Server pages can import and use Prisma directly — no API round-trip needed:</p>
                <CodeBlock filename="app/pages/blog/index.tsx" code={`import { prisma } from '../../lib/db'

export default async function BlogIndex() {
    const posts = await prisma.post.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        include: { author: true },
        take: 10,
    })

    return (
        <main>
            <h1>Blog</h1>
            {posts.map(post => (
                <article key={post.id}>
                    <h2>{post.title}</h2>
                    <p>By {post.author.name} · {post.createdAt.toLocaleDateString()}</p>
                </article>
            ))}
        </main>
    )
}`} />

                <h2>Use Prisma in API routes</h2>
                <p>Full CRUD via API routes — useful for client components that need to mutate data:</p>
                <CodeBlock filename="server/posts/index.ts" code={`import type { IncomingMessage, ServerResponse } from 'http'
import { prisma } from '../../lib/db'

export async function GET(req: IncomingMessage, res: ServerResponse) {
    const posts = await prisma.post.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
    })
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(posts))
}

export async function POST(req: IncomingMessage & { body: any }, res: ServerResponse) {
    const { title, content, authorId } = req.body

    const post = await prisma.post.create({
        data: { title, content, authorId },
    })

    res.writeHead(201, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(post))
}`} />
                <CodeBlock filename="server/posts/[id].ts" code={`import type { IncomingMessage, ServerResponse } from 'http'
import { prisma } from '../../lib/db'

export async function GET(req: IncomingMessage & { params: any }, res: ServerResponse) {
    const id = parseInt(req.params.id as string)
    const post = await prisma.post.findUnique({ where: { id } })

    if (!post) {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Not found' }))
        return
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(post))
}

export async function PATCH(req: IncomingMessage & { params: any; body: any }, res: ServerResponse) {
    const id = parseInt(req.params.id as string)
    const post = await prisma.post.update({
        where: { id },
        data: req.body,
    })
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(post))
}

export async function DELETE(req: IncomingMessage & { params: any }, res: ServerResponse) {
    const id = parseInt(req.params.id as string)
    await prisma.post.delete({ where: { id } })
    res.writeHead(204)
    res.end()
}`} />

                <h2>Client component calling the API</h2>
                <CodeBlock filename="app/components/PublishButton.tsx" code={`"use client"
import { useState } from 'react'

export default function PublishButton({ postId }: { postId: number }) {
    const [published, setPublished] = useState(false)
    const [loading, setLoading] = useState(false)

    async function publish() {
        setLoading(true)
        await fetch(\`/posts/\${postId}\`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ published: true }),
        })
        setPublished(true)
        setLoading(false)
    }

    return (
        <button onClick={publish} disabled={loading || published}>
            {published ? '✅ Published' : loading ? 'Publishing…' : 'Publish'}
        </button>
    )
}`} />

                <div className="doc-callout warning">
                    <span className="doc-callout-icon">⚠️</span>
                    <div className="doc-callout-body">
                        <strong>Add prisma/schema.prisma to .gitignore?</strong>
                        No — commit your schema. Add <code>.env</code> to <code>.gitignore</code> so <code>DATABASE_URL</code> stays secret.
                        Use environment variables in your deployment platform for production credentials.
                    </div>
                </div>
            </div>
        </article>
    )
}