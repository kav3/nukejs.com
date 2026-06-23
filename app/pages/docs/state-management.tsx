import { useHtml } from "nukejs"
import CodeBlock from "../../components/docs/CodeBlock"

export default function StateManagementPage() {
    const title = "State Management"
    const subtitle = "NukeJS ships a built-in store for sharing reactive state across client components that live in separate React roots."
    useHtml({ title })
    const prev = { href: "/docs/client-components", label: "Client Components" }
    const next = { href: "/docs/link-navigation", label: "Link & Navigation" }
    return (
        <article className="doc-article">
            <header className="doc-article-header">
                <h1 className="doc-article-title">{title}</h1>
                {subtitle && <p className="doc-article-subtitle">{subtitle}</p>}
            </header>

            <div className="doc-body">
                <p>
                    Because each <code>"use client"</code> component is hydrated into its own
                    independent React root, React Context cannot carry state across component
                    boundaries. The NukeJS store solves this — all state lives in{" "}
                    <code>window.__nukeStores</code>, a page-global Map shared by every bundle
                    regardless of how many times the store module is evaluated.
                </p>

                <h2>createStore</h2>
                <p>
                    Call <code>createStore</code> once at module scope with a unique name and
                    an initial state object. Define stores in their own files — no{" "}
                    <code>"use client"</code> directive needed.
                </p>
                <CodeBlock filename="app/stores/counter.ts" code={`import { createStore } from 'nukejs'

export const counterStore = createStore('counter', { count: 0 })`} />
                <p>
                    If two bundles call <code>createStore</code> with the same name, the first
                    one wins — subsequent calls reuse the existing entry and ignore{" "}
                    <code>initialState</code>.
                </p>

                <h2>useStore</h2>
                <p>
                    Call <code>useStore</code> inside any <code>"use client"</code> component
                    to subscribe to a store. The component re-renders whenever state changes,
                    regardless of which React root it lives in.
                </p>
                <CodeBlock filename="app/components/Counter.tsx" code={`"use client"
import { useStore } from 'nukejs'
import { counterStore } from '../stores/counter'

export default function Counter() {
    const { count } = useStore(counterStore)

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => counterStore.setState(s => ({ count: s.count + 1 }))}>
                Increment
            </button>
            <button onClick={() => counterStore.setState({ count: 0 })}>
                Reset
            </button>
        </div>
    )
}`} />

                <h3>Selector — avoid unnecessary re-renders</h3>
                <p>
                    Pass an optional selector as the second argument. The component only
                    re-renders when the selected value changes (by reference equality).
                </p>
                <CodeBlock filename="app/components/Counter.tsx" code={`// Re-renders only when \`count\` changes, not on any other state update
const count = useStore(counterStore, s => s.count)`} />

                <h2>Sharing state across components</h2>
                <p>
                    Stores are most powerful when two separate client components need to stay
                    in sync. Define the store in a shared file and import it from both:
                </p>
                <CodeBlock filename="app/stores/cart.ts" code={`import { createStore } from 'nukejs'

export type CartItem = { id: string; name: string; price: number }

export const cartStore = createStore('cart', {
    items: [] as CartItem[],
    total: 0,
})`} />
                <CodeBlock filename="app/components/AddToCartButton.tsx" code={`"use client"
import { cartStore, type CartItem } from '../stores/cart'

export default function AddToCartButton({ item }: { item: CartItem }) {
    return (
        <button
            onClick={() =>
                cartStore.setState(s => ({
                    items: [...s.items, item],
                    total: s.total + item.price,
                }))
            }
        >
            Add to cart
        </button>
    )
}`} />
                <CodeBlock filename="app/components/CartIcon.tsx" code={`"use client"
import { useStore } from 'nukejs'
import { cartStore } from '../stores/cart'

export default function CartIcon() {
    const { items, total } = useStore(cartStore)
    return (
        <span>
            🛒 {items.length} items — \${total.toFixed(2)}
        </span>
    )
}`} />
                <CodeBlock filename="app/pages/shop.tsx" code={`// Server component — zero JS cost
import AddToCartButton from '../components/AddToCartButton'
import CartIcon from '../components/CartIcon'

export default function ShopPage() {
    const item = { id: '1', name: 'Widget', price: 9.99 }
    return (
        <div>
            <CartIcon />
            <AddToCartButton item={item} />
        </div>
    )
}`} />
                <p>
                    <code>CartIcon</code> updates instantly when the button is clicked — they
                    are separate React roots, but both read and write through the same{" "}
                    <code>'cart'</code> entry in <code>window.__nukeStores</code>.
                </p>

                <h2>setState</h2>
                <p>
                    Accepts a full replacement value or an updater function that receives the
                    current state and returns the next state.
                </p>
                <CodeBlock filename="app/stores/cart.ts" code={`// Full replacement
cartStore.setState({ items: [], total: 0 })

// Updater function — receives current state, returns next state
cartStore.setState(s => ({ ...s, total: s.total + 5 }))`} />

                <h2>createPersistedStore</h2>
                <p>
                    <code>createPersistedStore</code> is a drop-in replacement for{" "}
                    <code>createStore</code> that survives full page refreshes by syncing state
                    to <code>localStorage</code> or <code>sessionStorage</code>. A plain{" "}
                    <code>createStore</code> lives only in <code>window.__nukeStores</code> and
                    is wiped on every hard reload — fine for ephemeral SPA state, but not for
                    data you want to persist.
                </p>
                <CodeBlock filename="app/stores/settings.ts" code={`import { createPersistedStore } from 'nukejs'

// Persists to localStorage under the key "nuke-store:settings"
export const settingsStore = createPersistedStore('settings', {
    theme: 'light' as 'light' | 'dark',
    language: 'en',
})`} />
                <p>
                    On first mount the stored value is read and applied via{" "}
                    <code>setState</code> immediately after the store is created. On every
                    subsequent state change the new value is written back. The{" "}
                    <code>initialState</code> you pass in is still used as the SSR snapshot,
                    so there are no hydration mismatches — components simply re-render with
                    the persisted value after mount.
                </p>
                <CodeBlock filename="app/components/ThemeToggle.tsx" code={`"use client"
import { useStore } from 'nukejs'
import { settingsStore } from '../stores/settings'

export default function ThemeToggle() {
    const { theme } = useStore(settingsStore)

    return (
        <button
            onClick={() =>
                settingsStore.setState(s => ({
                    ...s,
                    theme: s.theme === 'light' ? 'dark' : 'light',
                }))
            }
        >
            Switch to {theme === 'light' ? 'dark' : 'light'} mode
        </button>
    )
}`} />
                <p>
                    The selected theme is written to <code>localStorage</code> on every click
                    and restored automatically on the next page load — no extra wiring needed.
                </p>

                <h3>Storage backend</h3>
                <p>
                    Pass a third <code>options</code> argument to choose between{" "}
                    <code>localStorage</code> (default) and <code>sessionStorage</code>, or to
                    override the storage key:
                </p>
                <CodeBlock filename="app/stores/draft.ts" code={`import { createPersistedStore } from 'nukejs'

// sessionStorage — cleared when the tab closes
export const draftStore = createPersistedStore('draft', { text: '' }, {
    storage: 'session',
})

// Custom storage key
export const cartStore = createPersistedStore('cart', { items: [] }, {
    key: 'my-app:cart',
})`} />
                <div className="doc-table-wrap">
                    <table className="doc-table">
                        <thead><tr><th>Option</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
                        <tbody>
                            <tr><td><code>storage</code></td><td><code>'local' | 'session'</code></td><td><code>'local'</code></td><td>Storage backend. <code>'local'</code> persists across sessions; <code>'session'</code> is cleared when the tab closes.</td></tr>
                            <tr><td><code>key</code></td><td><code>string</code></td><td><code>nuke-store:{"{name}"}</code></td><td>Override the key used in storage.</td></tr>
                        </tbody>
                    </table>
                </div>

                <h2>API reference</h2>
                <div className="doc-table-wrap">
                    <table className="doc-table">
                        <thead>
                            <tr><th>API</th><th>Description</th></tr>
                        </thead>
                        <tbody>
                            <tr><td><code>createStore(name, initialState)</code></td><td>Creates or retrieves a named store backed by the page-global registry.</td></tr>
                            <tr><td><code>createPersistedStore(name, initialState, options?)</code></td><td>Like <code>createStore</code>, but syncs state to <code>localStorage</code> or <code>sessionStorage</code> so it survives page refreshes.</td></tr>
                            <tr><td><code>useStore(store)</code></td><td>Subscribes a component to the full store state.</td></tr>
                            <tr><td><code>useStore(store, selector)</code></td><td>Subscribes to a derived slice — re-renders only when the slice changes.</td></tr>
                            <tr><td><code>store.getState()</code></td><td>Returns the current state snapshot outside of React.</td></tr>
                            <tr><td><code>store.setState(updater)</code></td><td>Updates state and notifies all subscribers.</td></tr>
                            <tr><td><code>store.subscribe(listener)</code></td><td>Registers a raw change listener. Returns an unsubscribe function.</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </article>
    )
}