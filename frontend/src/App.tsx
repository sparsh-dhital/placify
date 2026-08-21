export default function App() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <article
        className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8"
        aria-labelledby="status-heading"
      >
        <header className="mb-6">
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-sm font-medium text-emerald-600 ring-1 ring-inset ring-emerald-600/20 mb-4">
            System Online
          </span>
          <h1
            id="status-heading"
            className="text-2xl font-semibold text-slate-900 tracking-tight"
          >
            Tailwind is Working
          </h1>
        </header>

        <p className="text-slate-600 leading-relaxed">
          If you are seeing a centered white card with a subtle shadow, emerald
          status badge, and clean typography, your Vite and Tailwind CSS
          pipeline is successfully configured.
        </p>

        <button
          type="button"
          className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-colors"
        >
          Begin Development
        </button>
      </article>
    </main>
  );
}