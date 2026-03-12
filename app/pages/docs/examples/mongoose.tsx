import { useHtml } from "nukejs"
import CodeBlock from "../../../components/docs/CodeBlock"

export default function MongoosePage() {
    const title = "Mongoose"
    const subtitle = "Connect NukeJS to MongoDB with Mongoose. Server pages and API routes have direct access to your models."
    useHtml({ title })
    const prev = { href: "/docs/examples/prisma", label: "Prisma" }
    const next = { href: "/docs/examples/orpc", label: "oRPC" }
    return (
        <article className="doc-article">
            <header className="doc-article-header">
                <h1 className="doc-article-title">{title}</h1>
                {subtitle && <p className="doc-article-subtitle">{subtitle}</p>}
            </header>

            <div className="doc-body">
                <div className="doc-integration-badge">Integration</div>

                <h2>Install</h2>
                <CodeBlock language="bash" filename="terminal" code={`npm install mongoose`} />
                <CodeBlock language="bash" filename=".env" code={`MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/mydb`} />

                <h2>Create a connection helper</h2>
                <p>MongoDB connections are expensive to create. Cache the connection in a module-level variable so it's reused across requests:</p>
                <CodeBlock filename="lib/mongoose.ts" code={`import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set')
}

// Module-level cache (survives hot reload in dev)
let cached = (global as any).mongoose as {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
}

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null }
}

export async function connectDB() {
    if (cached.conn) return cached.conn

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
        })
    }

    cached.conn = await cached.promise
    return cached.conn
}`} />

                <h2>Define a model</h2>
                <CodeBlock filename="lib/models/Post.ts" code={`import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPost extends Document {
    title: string
    slug: string
    content: string
    published: boolean
    author: string
    tags: string[]
    createdAt: Date
    updatedAt: Date
}

const PostSchema = new Schema<IPost>(
    {
        title:     { type: String, required: true },
        slug:      { type: String, required: true, unique: true },
        content:   { type: String, required: true },
        published: { type: Boolean, default: false },
        author:    { type: String, required: true },
        tags:      [{ type: String }],
    },
    { timestamps: true }
)

// Prevent model recompilation during hot reload
const Post: Model<IPost> =
    mongoose.models.Post ?? mongoose.model<IPost>('Post', PostSchema)

export default Post`} />

                <h2>Query from a server page</h2>
                <CodeBlock filename="app/pages/blog/index.tsx" code={`import { connectDB } from '../../lib/mongoose'
import Post from '../../lib/models/Post'

export default async function BlogIndex() {
    await connectDB()

    const posts = await Post.find({ published: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()

    return (
        <main>
            <h1>Blog</h1>
            {posts.map(post => (
                <article key={post._id.toString()}>
                    <h2>{post.title}</h2>
                    <p>By {post.author} · {new Date(post.createdAt).toLocaleDateString()}</p>
                    <a href={'/blog/' + post.slug}>Read more →</a>
                </article>
            ))}
        </main>
    )
}`} />

                <h2>Dynamic page with slug</h2>
                <CodeBlock filename="app/pages/blog/[slug].tsx" code={`import { connectDB } from '../../lib/mongoose'
import Post from '../../lib/models/Post'

export default async function BlogPost({ slug }: { slug: string }) {
    await connectDB()

    const post = await Post.findOne({ slug, published: true }).lean()

    if (!post) {
        return <h1>Post not found</h1>
    }

    return (
        <article>
            <h1>{post.title}</h1>
            <p>By {post.author} · {post.tags.join(', ')}</p>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
    )
}`} />

                <h2>CRUD API routes</h2>
                <CodeBlock filename="server/posts/index.ts" code={`import type { IncomingMessage, ServerResponse } from 'http'
import { connectDB } from '../../lib/mongoose'
import Post from '../../lib/models/Post'

export async function GET(req: IncomingMessage & { query: any }, res: ServerResponse) {
    await connectDB()

    const { tag, limit = '20' } = req.query
    const filter = tag ? { tags: tag, published: true } : { published: true }

    const posts = await Post.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('title slug author tags createdAt')
        .lean()

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(posts))
}

export async function POST(req: IncomingMessage & { body: any }, res: ServerResponse) {
    await connectDB()

    const { title, slug, content, author, tags } = req.body
    const post = await Post.create({ title, slug, content, author, tags })

    res.writeHead(201, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(post))
}`} />
                <CodeBlock filename="server/posts/[id].ts" code={`import type { IncomingMessage, ServerResponse } from 'http'
import { connectDB } from '../../lib/mongoose'
import Post from '../../lib/models/Post'

export async function GET(req: IncomingMessage & { params: any }, res: ServerResponse) {
    await connectDB()
    const post = await Post.findById(req.params.id).lean()
    if (!post) {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Not found' }))
        return
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(post))
}

export async function PATCH(req: IncomingMessage & { params: any; body: any }, res: ServerResponse) {
    await connectDB()
    const post = await Post.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    )
    if (!post) {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Not found' }))
        return
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(post))
}

export async function DELETE(req: IncomingMessage & { params: any }, res: ServerResponse) {
    await connectDB()
    await Post.findByIdAndDelete(req.params.id)
    res.writeHead(204)
    res.end()
}`} />

                <div className="doc-callout tip">
                    <span className="doc-callout-icon">✅</span>
                    <div className="doc-callout-body">
                        <strong>Always call .lean()</strong>
                        <code>.lean()</code> returns plain JavaScript objects instead of Mongoose Document instances.
                        This is important when passing data as props to server components — the objects are fully serializable.
                    </div>
                </div>
            </div>
        </article>
    )
}