"use client"
import { Link } from "nukejs"
import { useState, useEffect } from "react"

const NAV = [
    {
        group: 'Getting Started',
        items: [
            { label: 'Introduction', href: '/docs' },
            { label: 'Installation', href: '/docs/installation' },
            { href: "/docs/project-structure", label: "Project Structure" },
        ],
    },
    {
        group: 'Core',
        items: [
            { label: 'Routing', href: '/docs/routing' },
            { label: 'Layouts', href: '/docs/layouts' },
            { label: 'Client Components', href: '/docs/client-components' },
            { label: 'Link & Navigation', href: '/docs/link-navigation' },
            { label: 'API Routes', href: '/docs/api-routes' },
            { label: 'Middleware', href: '/docs/middleware' },
            { label: 'Static Files', href: '/docs/static-files' },
        ],
    },
    {
        group: 'Advanced',
        items: [
            { label: 'useHtml()', href: '/docs/head-management' },
            { label: 'Configuration', href: '/docs/configuration' },
            { label: 'Deploying', href: '/docs/deploying' },
        ],
    },
    {
        group: 'Examples',
        items: [
            { label: 'Tailwind CSS', href: '/docs/examples/tailwindcss' },
            { label: 'Prisma', href: '/docs/examples/prisma' },
            { label: 'Mongoose', href: '/docs/examples/mongoose' },
            { label: 'oRPC', href: '/docs/examples/orpc' },
        ],
    },
]

export default function DocSidebar() {
    const [path, setPath] = useState("")
    const [open, setOpen] = useState(false)

    useEffect(() => {
        setPath(window.location.pathname)
    }, [])

    // Close on route change (for client-side nav)
    useEffect(() => {
        if (!open) return
        const close = () => setOpen(false)
        window.addEventListener("popstate", close)
        return () => window.removeEventListener("popstate", close)
    }, [open])

    return (
        <>
            {/* Mobile hamburger toggle */}
            <button
                className={`doc-sidebar-toggle${open ? " open" : ""}`}
                onClick={() => setOpen(o => !o)}
                aria-label={open ? "Close navigation" : "Open navigation"}
                aria-expanded={open}
            >
                <span />
                <span />
                <span />
            </button>

            {/* Backdrop overlay for mobile */}
            {open && (
                <div
                    className="doc-sidebar-overlay"
                    onClick={() => setOpen(false)}
                    aria-hidden="true"
                />
            )}

            <aside className={`doc-sidebar${open ? " open" : ""}`}>
                <span>
                    {NAV.map(section => (
                        <div key={section.group} className="doc-nav-group">
                            <p className="doc-nav-label">{section.group}</p>
                            <ul>
                                {section.items.map(item => {
                                    const active = path === item.href
                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className={`doc-nav-link${active ? " active" : ""}`}
                                            >
                                                {item.label}
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    ))}
                </span>
            </aside>
        </>
    )
}
