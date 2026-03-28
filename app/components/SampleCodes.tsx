"use client"

import { useState } from "react"
import CodeBlock from "./docs/CodeBlock"

export default function SampleCodes() {

    const TABS = [
        { id: 'index', label: 'app/pages/index.tsx' },
        { id: 'layout', label: 'app/pages/layout.tsx' },
        { id: 'api', label: 'server/api/time.ts' }
    ] as const;

    type TabId = typeof TABS[number]['id'];

    const [activeTab, setActiveTab] = useState<TabId>('index');

    return <div className="code-window">
        <div className="win-bar">
            <div className="d" /><div className="d" /><div className="d" />
        </div>

        <div className="win-tabs">
            {TABS.map(({ id, label }) => (
                <div
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`win-tab ${activeTab === id ? 'active' : ''}`}
                >
                    {label}
                </div>
            ))}
        </div>

        <div className="win-body">
            {activeTab === "index" && <CodeBlock code={`import { useHtml } from "nukejs";
export default async function Index() {
    const title = "Full-stack JS Framework"
    useHtml({
        title,
        htmlAttrs: {
            lang: "en"
        },
        meta: [{ 
            name: "description", 
            content: "React. Weaponized."
        }]
    })
    return <>
                <h1>{title}</h1>
           </>
}`} language="javascript" />}

            {activeTab === "layout" && <CodeBlock code={`import { ReactNode } from "react";
import { useHtml } from "nukejs";

export default function Layout({ children }: { children: ReactNode }) {
    useHtml({
        title: (t) => { return \`Nukejs - \${t}\` },
        link: [{
            rel: "stylesheet",
            href: "/main.css"
        }]
    })
    return <div className="flex">
        <div className="flex m-auto">{children}</div>
    </div>
}`} language="javascript" />}
            {activeTab === "api" && <CodeBlock code={`export async function GET(req: any, res: any) {
        res.json({time: Date.now()});
        res.end()
    }`} language="javascript" />}

        </div>
    </div>

}