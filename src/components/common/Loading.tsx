import React from 'react';

interface LoadingProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

const Loading: React.FC<LoadingProps> = ({
    message = 'Loading...',
    size = 'md'
}) => {
    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    return (
        <div className="flex items-center justify-center">
            <div className="text-center">
                <div className={`animate-spin rounded-full border-b-2 border-blue-500 mx-auto mb-4 ${sizeClasses[size]}`}></div>
                <div className="text-gray-600">{message}</div>
            </div>
        </div>
    );
};

export default Loading;
