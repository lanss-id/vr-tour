import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Edit3, Eye, Settings } from 'lucide-react';

const Navigation: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Viewer', icon: Eye },
        { path: '/editor', label: 'Old Editor', icon: Edit3 },
        { path: '/new-editor', label: 'New Editor', icon: Settings },
    ];

    return (
        <div className="fixed top-4 left-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-2">
                <div className="flex space-x-1">
                    {navItems.map(({ path, label, icon: IconComponent }) => (
                        <Link
                            key={path}
                            to={path}
                            className={`p-2 rounded-md transition-colors ${
                                location.pathname === path
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                            title={label}
                        >
                            <IconComponent className="w-4 h-4" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Navigation; 