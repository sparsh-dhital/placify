export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080B12] text-text-primary">
      <div className="w-full max-w-md rounded-2xl border border-[#253047] bg-[#0D111A] p-8 shadow-lg">
        <h1 className="mb-2 text-2xl font-semibold">Welcome to Placify</h1>
        <p className="mb-6 text-sm text-text-secondary">
          Sign in to continue to your placement dashboard.
        </p>

        <button
          type="button"
          className="w-full rounded-lg bg-accent-primary px-4 py-2.5 font-medium text-white transition hover:bg-accent-secondary"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
