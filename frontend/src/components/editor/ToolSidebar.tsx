import { motion } from 'framer-motion';
import type { EditToolId } from '@/types/edit';
import { TOOLS, TOOL_CATEGORIES } from '@/components/editor/EditorPanel';
import { ImageIcon } from '@/components/icons/UploadIcons';
import { ChevronLeftIcon } from '@/components/icons/EditorIcons';

interface ToolSidebarProps {
  activeTool: EditToolId | null;
  onSelect: (tool: EditToolId | null) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /** True before an image is loaded — tools render but are inert. */
  disabled?: boolean;
}

const TOOLS_BY_ID = Object.fromEntries(TOOLS.map((t) => [t.id, t]));

export function ToolSidebar({ activeTool, onSelect, collapsed, onToggleCollapsed, disabled = false }: ToolSidebarProps) {
  return (
    <aside
      style={{ width: collapsed ? 56 : 208 }}
      className="flex shrink-0 flex-col overflow-hidden border-r border-border bg-surface shadow-[1px_0_0_rgba(15,15,16,0.02)] transition-[width] duration-200 ease-out dark:border-border-dark/60 dark:bg-surface-dark"
    >
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-2 py-3">
        {/* Overview entry */}
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
              {!collapsed && (
                <p
                  className={[
                    'mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-widest',
                    disabled
                      ? 'text-ink-tertiary/40 dark:text-ink-dark-tertiary/40'
                      : 'text-ink-tertiary dark:text-ink-dark-tertiary',
                  ].join(' ')}
                >
                  {category.label}
                </p>
              )}
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
      <div className="border-t border-border/50 p-2 dark:border-border-dark/40">
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-md text-[13px] font-medium text-ink-secondary transition-colors hover:bg-black/5 hover:text-ink dark:text-ink-dark-secondary dark:hover:bg-white/5 dark:hover:text-ink-dark"
        >
          <ChevronLeftIcon
            className={`h-[18px] w-[18px] shrink-0 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
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
        collapsed ? 'mx-auto h-11 w-11 justify-center' : 'h-11 w-full gap-[12px] px-2.5',
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
          className="absolute inset-0 rounded-md bg-accent-subtle dark:bg-accent-subtle-dark"
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
      )}
      {!isActive && !disabled && (
        <span className="absolute inset-0 rounded-md bg-black/5 opacity-0 transition-opacity duration-100 group-hover:opacity-100 dark:bg-white/5" />
      )}
      <Icon className="relative h-[18px] w-[18px] shrink-0" />
      {!collapsed && (
        <span className="relative truncate text-[14px] font-medium leading-[1.3]">{label}</span>
      )}
    </button>
  );
}
