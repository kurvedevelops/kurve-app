import { cn } from '@/lib/utils'

type Role = 'admin' | 'editor' | 'viewer'

const config = {
  admin: {
    label: 'Admin',
    className: 'bg-purple-100 text-purple-700',
  },
  editor: {
    label: 'Editor',
    className: 'bg-blue-100 text-blue-700',
  },
  viewer: {
    label: 'Viewer',
    className: 'bg-gray-100 text-gray-600',
  },
}

export function RoleBadge({ role }: { role: Role }) {
  const { label, className } = config[role]
  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', className)}>
      {label}
    </span>
  )
}