import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center px-3 py-10 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 text-ink-secondary dark:text-ink-dark-secondary">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="mt-3 inline-flex items-center rounded-DEFAULT bg-ink dark:bg-ink-dark px-3 py-1.5 text-sm font-medium text-canvas dark:text-canvas-dark transition-opacity hover:opacity-90"
      >
        Back to home
      </Link>
    </div>
  );
}
