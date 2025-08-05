import React from 'react';
import { X } from 'lucide-react';
import Button from '../common/Button';

interface HotspotInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotspot: {
    title: string;
    content: string;
    type: string;
  } | null;
}

const HotspotInfoModal: React.FC<HotspotInfoModalProps> = ({ 
  isOpen, 
  onClose, 
  hotspot 
}) => {
  if (!isOpen || !hotspot) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-sm font-medium">
                {hotspot.type === 'info' && 'ℹ️'}
                {hotspot.type === 'link' && '🔗'}
                {hotspot.type === 'custom' && '⭐'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {hotspot.title}
            </h3>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="prose prose-sm max-w-none">
            <div 
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: hotspot.content }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t">
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HotspotInfoModal; 