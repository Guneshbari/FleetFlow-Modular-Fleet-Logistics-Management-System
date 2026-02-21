interface StatusBadgeProps {
  status: 'available' | 'on-trip' | 'in-shop' | 'completed' | 'pending' | 'active' | 'inactive';
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const statusConfig = {
    'available': { bg: 'bg-[#22C55E]/10', text: 'text-[#22C55E]', label: 'Available' },
    'on-trip': { bg: 'bg-[#FACC15]/10', text: 'text-[#FACC15]', label: 'On Trip' },
    'in-shop': { bg: 'bg-[#EF4444]/10', text: 'text-[#EF4444]', label: 'In Shop' },
    'completed': { bg: 'bg-[#22C55E]/10', text: 'text-[#22C55E]', label: 'Completed' },
    'pending': { bg: 'bg-[#FACC15]/10', text: 'text-[#FACC15]', label: 'Pending' },
    'active': { bg: 'bg-[#22C55E]/10', text: 'text-[#22C55E]', label: 'Active' },
    'inactive': { bg: 'bg-[#A1A1AA]/10', text: 'text-[#A1A1AA]', label: 'Inactive' },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {label || config.label}
    </span>
  );
}
