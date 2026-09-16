export default function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white py-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 text-center text-xs text-zinc-500 sm:flex-row sm:justify-between sm:text-left dark:text-zinc-500">
        <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Code<span className="text-indigo-600">Critic</span>
        </span>
        <span className="font-mono">&copy; 2026 CodeCritic. For developers, by developers.</span>
      </div>
    </footer>
  );
}
