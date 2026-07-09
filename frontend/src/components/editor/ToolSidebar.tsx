import { motion, AnimatePresence } from 'framer-motion';
import type { EditToolId } from '@/types/edit';
import { TOOLS, TOOL_CATEGORIES } from '@/components/editor/EditorPanel';
import { ImageIcon } from '@/components/icons/UploadIcons';
import { ChevronLeftIcon } from '@/components/icons/EditorIcons';

interface ToolSidebarProps {
  activeTool: EditToolId | null;
  onSelect: (tool: EditToolId | null) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  disabled?: boolean;
}

const TOOLS_BY_ID = Object.fromEntries(TOOLS.map((t) => [t.id, t]));

// Spring for sidebar width collapse/expand
const WIDTH_SPRING = { type: 'spring' as const, stiffness: 380, damping: 38, mass: 0.9 };

// Light mode: solid white surface, shadow-ambient
// Dark mode: glass panel — semi-transparent bg + backdrop blur + inner shimmer + deep drop shadow
const PANEL_BASE = [
  'm-2 flex shrink-0 flex-col overflow-hidden rounded-2xl',
  // light
  'border border-border bg-surface shadow-ambient',
  // dark — glass float
  'dark:border-white/[0.075] dark:bg-surface-dark/80 dark:backdrop-blur-glass dark:shadow-glass-panel',
].join(' ');

export function ToolSidebar({ activeTool, onSelect, collapsed, onToggleCollapsed, disabled = false }: ToolSidebarProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -12, width: collapsed ? 56 : 192 }}
      animate={{ opacity: 1, x: 0, width: collapsed ? 56 : 192 }}
      transition={{
        opacity: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
        x: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
        width: WIDTH_SPRING,
      }}
      className={PANEL_BASE}
    >
      <div className={['flex flex-1 flex-col gap-3 overflow-y-auto py-3', collapsed ? 'px-1.5' : 'px-2'].join(' ')}>
        {/* Overview */}
        <SidebarButton
          label="Overview"
          icon={ImageIcon}
          isActive={activeTool === null}
          collapsed={collapsed}
          disabled={disabled}
          onClick={() => onSelect(null)}
        />

        <div className="flex flex-col gap-3">
          {TOOL_CATEGORIES.map((category) => (
            <div key={category.label} className="flex flex-col">
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.p
                    key="cat-label"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className={[
                      'mb-1 overflow-hidden px-2.5 text-[10px] font-semibold uppercase tracking-widest',
                      disabled
                        ? 'text-ink-tertiary/40 dark:text-ink-dark-tertiary/40'
                        : 'text-ink-tertiary dark:text-ink-dark-tertiary',
                    ].join(' ')}
                  >
                    {category.label}
                  </motion.p>
                )}
              </AnimatePresence>
              {category.ids.map((id) => {
                const tool = TOOLS_BY_ID[id];
                if (!tool) return null;
                return (
                  <SidebarButton
                    key={id}
                    label={tool.label}
                    icon={tool.icon}
                    isActive={activeTool === id}
                    collapsed={collapsed}
                    disabled={disabled}
                    onClick={() => onSelect(id)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Collapse toggle */}
      <div className="border-t border-border/50 p-2 dark:border-white/[0.06]">
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-md text-[13px] font-medium text-ink-secondary transition-colors hover:bg-black/5 hover:text-ink dark:text-ink-dark-secondary dark:hover:bg-white/[0.06] dark:hover:text-ink-dark"
        >
          <motion.span
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={WIDTH_SPRING}
            className="flex shrink-0 items-center justify-center"
          >
            <ChevronLeftIcon className="h-[18px] w-[18px]" />
          </motion.span>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key="collapse-label"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="overflow-hidden whitespace-nowrap"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}

function SidebarButton({
  label,
  icon: Icon,
  isActive,
  collapsed,
  disabled,
  onClick,
}: {
  label: string;
  icon: typeof ImageIcon;
  isActive: boolean;
  collapsed: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={isActive ? 'true' : undefined}
      title={disabled ? 'Upload an image to unlock tools' : collapsed ? label : undefined}
      className={[
        'group relative flex items-center rounded-md transition-colors duration-100 select-none',
        collapsed ? 'mx-auto h-11 w-11 justify-center' : 'h-11 w-full gap-[12px] pl-[13px] pr-2.5',
        disabled
          ? 'cursor-not-allowed text-ink-tertiary/50 dark:text-ink-dark-tertiary/40'
          : isActive
            ? 'text-accent'
            : 'text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark',
      ].join(' ')}
    >
      {isActive && !disabled && (
        <motion.span
          layoutId="tool-sidebar-active-bg"
          className="absolute inset-0 rounded-md bg-accent-subtle/50 dark:bg-accent-subtle-dark/60"
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
      )}
      {isActive && !disabled && !collapsed && (
        <motion.span
          layoutId="tool-sidebar-active-bar"
          className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] rounded-full bg-accent"
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
      )}
      {!isActive && !disabled && (
        <span className="absolute inset-0 rounded-md bg-black/5 opacity-0 transition-opacity duration-100 group-hover:opacity-100 dark:bg-white/[0.06]" />
      )}
      <Icon className="relative h-[18px] w-[18px] shrink-0" />
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            key="tool-label"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative overflow-hidden whitespace-nowrap text-[14px] font-medium leading-[1.3]"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
