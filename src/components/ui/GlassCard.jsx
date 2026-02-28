import React from 'react';

const GlassCard = ({ children, className = '', hover = true, ...props }) => {
    return (
        <div
            className={`glass-panel ${hover ? 'glass-panel-hover' : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default GlassCard;
