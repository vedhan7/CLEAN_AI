import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    variant = 'primary',
    isLoading = false,
    className = '',
    ...props
}) => {
    const baseClass = "inline-flex items-center justify-center font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-[var(--c-emerald)] text-[var(--c-midnight)] px-6 py-3 rounded-xl hover:scale-[1.02] hover:shadow-[0_0_15px_var(--c-emerald-dim)]",
        secondary: "bg-[var(--glass-bg)] border border-[var(--glass-border)] text-white px-6 py-3 rounded-xl hover:bg-[var(--c-midnight-lighter)] hover:border-white/20",
        ghost: "bg-transparent text-white px-4 py-2 hover:bg-white/10 rounded-lg",
        danger: "bg-[var(--c-rose)] text-white px-6 py-3 rounded-xl hover:scale-[1.02]"
    };

    return (
        <button
            className={`${baseClass} ${variants[variant]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
};

export default Button;
