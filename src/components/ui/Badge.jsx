import React from 'react';

const priorityColors = {
    critical: 'bg-[var(--c-rose)]/20 text-[var(--c-rose)] border-[var(--c-rose)]/30',
    high: 'bg-[var(--c-saffron)]/20 text-[var(--c-saffron)] border-[var(--c-saffron)]/30',
    medium: 'bg-[var(--c-emerald)]/20 text-[var(--c-emerald)] border-[var(--c-emerald)]/30',
    low: 'bg-[#9CA3AF]/20 text-[#9CA3AF] border-[#9CA3AF]/30',
};

const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    dispatched: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    in_progress: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
    resolved: 'bg-[var(--c-emerald)]/20 text-[var(--c-emerald)] border-[var(--c-emerald)]/30',
    escalated: 'bg-[var(--c-rose)]/20 text-[var(--c-rose)] border-[var(--c-rose)]/30'
};

const Badge = ({ children, type = 'status', value }) => {
    const colors = type === 'priority' ? priorityColors[value] : statusColors[value];
    const defaultColors = 'bg-gray-500/20 text-gray-300 border-gray-500/30';

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors || defaultColors} uppercase tracking-wider`}>
            {children}
        </span>
    );
};

export default Badge;
