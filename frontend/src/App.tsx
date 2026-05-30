import "./App.css";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 grid place-items-center text-lg font-bold">
            OC
          </div>
          <div>
            <p className="text-sm text-slate-400">OpenClaw</p>
            <h1 className="text-xl font-semibold">OpenClaw Test</h1>
          </div>
        </div>
        <nav className="hidden sm:flex items-center gap-4 text-sm text-slate-300">
          <a className="hover:text-white" href="#features">Features</a>
          <a className="hover:text-white" href="#setup">Setup</a>
          <a className="hover:text-white" href="#cta">Get Started</a>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-10">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm uppercase tracking-widest text-indigo-400">OpenClaw starter</p>
            <h2 className="text-4xl font-bold leading-tight">
              Build faster with a clean, modern OpenClaw landing page
            </h2>
            <p className="text-slate-300">
              This is a simple, production-ready homepage you can customize for your OpenClaw
              projects. Swap the copy, add sections, and ship.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold hover:bg-indigo-500">
                Start Building
              </button>
              <button className="rounded-xl border border-slate-700 px-5 py-2 text-sm text-slate-200 hover:border-slate-500">
                View Docs
              </button>
            </div>
          </div>
        </section>

        <section id="features" className="py-12 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Fast setup",
              description: "Vite + React + Tailwind wired up and ready to ship."
            },
            {
              title: "Clean structure",
              description: "Reusable sections with sensible spacing and typography."
            },
            {
              title: "Easy to extend",
              description: "Add pages, routes, and components without refactors."
            }
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{item.description}</p>
            </div>
          ))}
        </section>

        <section id="setup" className="rounded-3xl border border-slate-800 bg-slate-900/60 p-10">
          <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
            <div>
              <h3 className="text-2xl font-semibold">Quick setup</h3>
              <p className="mt-2 text-slate-300">
                Edit <code className="rounded bg-slate-800 px-2 py-1">src/App.tsx</code> and keep
                building. Tailwind styles apply instantly.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-950/70 p-4 text-sm text-slate-300">
              <p className="font-semibold text-slate-100">Commands</p>
              <ul className="mt-2 space-y-1">
                <li>npm install</li>
                <li>npm run dev</li>
                <li>npm run build</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="cta" className="py-12 text-center">
          <h3 className="text-2xl font-semibold">Ready to ship your OpenClaw project?</h3>
          <p className="mt-2 text-slate-300">Customize this page and launch in minutes.</p>
          <button className="mt-4 rounded-xl bg-emerald-500 px-6 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400">
            Create Project
          </button>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 py-8 text-sm text-slate-500">
        © {new Date().getFullYear()} OpenClaw. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
