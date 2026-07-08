/** Shown in the properties panel before an image is loaded. */
export function WelcomePanel() {
  return (
    <div className="flex flex-col gap-3 py-2">
      <h2 className="text-base font-semibold text-ink dark:text-ink-dark leading-snug">
        Nothing loaded yet
      </h2>
      <p className="text-[13px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
        Drop an image onto the canvas to unlock every tool in the sidebar.
      </p>
    </div>
  );
}
