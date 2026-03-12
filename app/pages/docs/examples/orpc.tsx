import { useHtml } from "nukejs"
import CodeBlock from "../../../components/docs/CodeBlock"

export default function ORPCPage() {
    const title = "oRPC"
    const subtitle =
        "Type-safe RPC for TypeScript. Define procedures on the server and call them from the client with full end-to-end type inference."

    useHtml({ title })

    const prev = { href: "/docs/examples/mongoose", label: "Mongoose" }
    const next = { href: "/docs/examples/prisma", label: "Prisma" }

    return (
        <article className="doc-article">
            <header className="doc-article-header">
                <h1 className="doc-article-title">{title}</h1>
                {subtitle && <p className="doc-article-subtitle">{subtitle}</p>}
            </header>

            <div className="doc-body">

                <div className="doc-integration-badge">Integration</div>

                <p>
                    <a href="https://orpc.dev" target="_blank" rel="noopener noreferrer">
                        oRPC
                    </a>{" "}
                    is a type-safe RPC library for TypeScript. It lets you define
                    server procedures and call them from both server components and
                    client components with full type safety.
                </p>

                <h2>Install</h2>

                <CodeBlock
                    language="bash"
                    filename="terminal"
                    code={`npm install @orpc/server @orpc/client`}
                />

                <h2>Define your router</h2>

                <CodeBlock
                    language="typescript"
                    filename="router.ts"
                    code={`import { os } from "@orpc/server";

export const router = {
  time: {
    getCurrent: os.handler(() => {
      return Date.now();
    })
  }
};`}
                />

                <h2>Create the client</h2>

                <CodeBlock
                    language="typescript"
                    filename="client.ts"
                    code={`import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { RouterClient } from '@orpc/server'
import type { router } from './router'

const baseURL =
  typeof window !== 'undefined'
    ? \`\${window.location.origin}/rpc\`
    : process.env.RPC_URL || 'http://localhost:3000/rpc'

const link = new RPCLink({ url: baseURL })

export const orpc: RouterClient<typeof router> =
  createORPCClient(link)`}
                />

                <h2>Register the RPC handler</h2>

                <CodeBlock
                    language="typescript"
                    filename="server/rpc/[...rest].ts"
                    code={`import { RPCHandler } from '@orpc/server/node'
import { onError } from '@orpc/server'
import { router } from '../../router'

const handler = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      console.error(error)
    })
  ]
})

async function handleRequest(req: any, res: any) {
  const { matched } = await handler.handle(req, res, {
    prefix: '/rpc',
    context: {}
  })

  if (matched) return

  res.json({ error: 404 })
}

export const HEAD = handleRequest
export const GET = handleRequest
export const POST = handleRequest
export const PUT = handleRequest
export const PATCH = handleRequest
export const DELETE = handleRequest`}
                />

                <h2>Call procedures from a server page</h2>

                <CodeBlock
                    language="typescript"
                    filename="app/pages/index.tsx"
                    code={`import { useHtml } from "nukejs"
import { orpc } from "../../client"

export default async function Index() {
  useHtml({ title: "Home" })

  const currentTime = await orpc.time.getCurrent()

  return (
    <main>
      <h1>Server time</h1>
      <p>{currentTime}</p>
    </main>
  )
}`}
                />

                <h2>Call procedures from a client component</h2>

                <CodeBlock
                    language="typescript"
                    filename="app/components/TimeDisplay.tsx"
                    code={`"use client"

import { useState } from "react"
import { orpc } from "../../client"

export default function TimeDisplay() {
  const [time, setTime] = useState<number | null>(null)

  async function refresh() {
    setTime(await orpc.time.getCurrent())
  }

  return (
    <div>
      <p>{time ?? "—"}</p>
      <button onClick={refresh}>Refresh</button>
    </div>
  )
}`}
                />

                <div className="doc-callout tip">
                    <span className="doc-callout-icon">💡</span>
                    <div className="doc-callout-body">
                        <strong>Type inference is automatic</strong>
                        The client type is inferred from the router, so procedure
                        arguments and return values are fully typed across the
                        client and server without generating any code.
                    </div>
                </div>

            </div>
        </article>
    )
}