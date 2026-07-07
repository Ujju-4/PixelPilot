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
}

const TOOLS_BY_ID = Object.fromEntries(TOOLS.map((t) => [t.id, t]));

export function ToolSidebar({ activeTool, onSelect, collapsed, onToggleCollapsed }: ToolSidebarProps) {
  return (
    <aside
      style={{ width: collapsed ? 48 : 192 }}
      className="flex shrink-0 flex-col border-r border-border/40 dark:border-border-dark/60 bg-surface dark:bg-surface-dark transition-[width] duration-200 ease-out overflow-hidden"
    >
      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-1.5 py-2">
        {/* Overview entry */}
        <SidebarButton
          label="Overview"
          icon={ImageIcon}
          isActive={activeTool === null}
          collapsed={collapsed}
          onClick={() => onSelect(null)}
        />

        <div className="my-1.5 h-px bg-border/40 dark:bg-border-dark/40 mx-1" />

        {TOOL_CATEGORIES.map((category) => (
          <div key={category.label} className="flex flex-col gap-0.5">
            {!collapsed && (
              <p className="mt-1.5 mb-0.5 px-2 text-[9px] font-semibold uppercase tracking-widest text-ink-tertiary dark:text-ink-dark-tertiary">
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
                  onClick={() => onSelect(id)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Collapse toggle */}
      <div className="border-t border-border/40 dark:border-border-dark/40 p-1.5">
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex w-full items-center justify-center gap-1.5 rounded py-1.5 px-2 text-xs text-ink-secondary dark:text-ink-dark-secondary transition-colors hover:bg-canvas dark:hover:bg-canvas-dark hover:text-ink dark:hover:text-ink-dark"
        >
          <ChevronLeftIcon
            className={`h-3 w-3 shrink-0 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
          />
          {!collapsed && <span className="text-xs">Collapse</span>}
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
  onClick,
}: {
  label: string;
  icon: typeof ImageIcon;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'true' : undefined}
      title={collapsed ? label : undefined}
      className={[
        'group relative flex items-center rounded transition-colors duration-100 select-none',
        collapsed ? 'justify-center h-8 w-8 mx-auto' : 'gap-2 px-2 py-1.5',
        isActive
          ? 'text-accent dark:text-accent'
          : 'text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark',
      ].join(' ')}
    >
      {isActive && (
        <motion.span
          layoutId="tool-sidebar-active-bg"
          className="absolute inset-0 rounded bg-accent-subtle dark:bg-accent-subtle-dark ring-1 ring-accent/15 dark:ring-accent/20"
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
      )}
      {!isActive && (
        <span className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 bg-canvas dark:bg-canvas-dark transition-opacity duration-100" />
      )}
      <Icon className="relative h-3.5 w-3.5 shrink-0" />
      {!collapsed && (
        <span className="relative text-xs font-medium truncate leading-none">{label}</span>
      )}
    </button>
  );
}
