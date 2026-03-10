import { useHtml } from "nukejs"
import CodeBlock from "../../components/docs/CodeBlock"

export default function ApiRoutesPage() {
    const title = "API Routes"
    const subtitle = "Export named HTTP method handlers from files in server/ and they become fully typed API endpoints."
    useHtml({ title })
    return (
        <article className="doc-article">
            <header className="doc-article-header">
                <h1 className="doc-article-title">{title}</h1>
                <p className="doc-article-subtitle">{subtitle}</p>
            </header>

            <div className="doc-body">
                <h2>Creating a route</h2>
                <p>Create a <code>.ts</code> file in <code>server/</code> and export named functions matching HTTP methods. The file path maps to the URL the same way pages do:</p>
                <CodeBlock filename="server/users/index.ts  →  GET /users, POST /users" code={`import type { ApiRequest, ApiResponse } from 'nukejs'

export async function GET(req: ApiRequest, res: ApiResponse) {
    const users = await db.getUsers()
    res.json(users)
}

export async function POST(req: ApiRequest, res: ApiResponse) {
    const user = await db.createUser(req.body)
    res.json(user, 201)
}`} />

                <h2>Dynamic API routes</h2>
                <p>Use <code>[param]</code> in the filename. Route params land in <code>req.params</code>:</p>
                <CodeBlock filename="server/users/[id].ts  →  /users/:id" code={`import type { ApiRequest, ApiResponse } from 'nukejs'

export async function GET(req: ApiRequest, res: ApiResponse) {
    const { id } = req.params as { id: string }
    const user = await db.getUser(id)

    if (!user) {
        res.json({ error: 'Not found' }, 404)
        return
    }

    res.json(user)
}

export async function PUT(req: ApiRequest, res: ApiResponse) {
    const { id } = req.params as { id: string }
    const updated = await db.updateUser(id, req.body)
    res.json(updated)
}

export async function DELETE(req: ApiRequest, res: ApiResponse) {
    await db.deleteUser(req.params.id as string)
    res.status(204).end()
}`} />

                <h2>Query string parameters</h2>
                <p>Query params land in <code>req.query</code> as plain strings alongside <code>req.params</code>:</p>
                <CodeBlock filename="server/products/[id].ts  →  /products/:id?include=reviews" code={`export async function GET(req: ApiRequest, res: ApiResponse) {
    const { id } = req.params as { id: string }
    const { include } = req.query   // e.g. ?include=reviews

    const product = await db.getProduct(id)

    if (include === 'reviews') {
        product.reviews = await db.getReviews(id)
    }

    res.json(product)
}`} />

                <h2>Request object</h2>
                <div className="doc-table-wrap">
                    <table className="doc-table">
                        <thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead>
                        <tbody>
                            <tr><td>req.body</td><td>any</td><td>Parsed JSON body (or raw string). Up to 10 MB.</td></tr>
                            <tr><td>req.params</td><td>Record&lt;string, string | string[]&gt;</td><td>Dynamic path segments</td></tr>
                            <tr><td>req.query</td><td>Record&lt;string, string&gt;</td><td>URL search params</td></tr>
                            <tr><td>req.method</td><td>string</td><td>HTTP method (GET, POST, …)</td></tr>
                            <tr><td>req.headers</td><td>IncomingHttpHeaders</td><td>Raw request headers</td></tr>
                        </tbody>
                    </table>
                </div>

                <h2>Response object</h2>
                <div className="doc-table-wrap">
                    <table className="doc-table">
                        <thead><tr><th>Method</th><th>Description</th></tr></thead>
                        <tbody>
                            <tr><td>res.json(data, status?)</td><td>Send JSON. Default status 200.</td></tr>
                            <tr><td>res.status(code)</td><td>Set status code, returns res for chaining.</td></tr>
                            <tr><td>res.setHeader(name, value)</td><td>Set a response header.</td></tr>
                            <tr><td>res.end(body?)</td><td>Send a raw response and close.</td></tr>
                        </tbody>
                    </table>
                </div>

                <h2>Calling API logic from pages</h2>
                <p>Because pages are server components, you can import and call your database layer directly — skipping the HTTP round-trip entirely:</p>
                <CodeBlock filename="app/pages/users.tsx" code={`import { getUsers } from '../../lib/db'

export default async function UsersPage() {
    const users = await getUsers() // no fetch() needed

    return (
        <ul>
            {users.map(u => <li key={u.id}>{u.name}</li>)}
        </ul>
    )
}`} />

                <div className="doc-callout info">
                    <span className="doc-callout-icon">ℹ️</span>
                    <div className="doc-callout-body">
                        <strong>API routes are for your frontend clients</strong>{" "}
                        Server-rendered pages can call database code directly. API routes are most useful
                        for client components making <code>fetch()</code> calls, or for third-party integrations.
                    </div>
                </div>
            </div>
        </article>
    )
}