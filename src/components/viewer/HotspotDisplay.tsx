import React, { useEffect, useState } from 'react';
import { useViewerStore } from '../../store/viewerStore';
import { getHotspotsForPanorama } from '../../services/migrationService';
import HotspotInfoModal from './HotspotInfoModal';

interface HotspotDisplayProps {
  viewer: any;
}

const HotspotDisplay: React.FC<HotspotDisplayProps> = ({ viewer }) => {
  const { currentNodeId, setCurrentNode } = useViewerStore();
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load hotspots when panorama changes
  useEffect(() => {
    const loadHotspots = async () => {
      if (!currentNodeId) {
        console.log('No currentNodeId, skipping hotspot load');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('Loading hotspots for panorama:', currentNodeId);
        const hotspotsData = await getHotspotsForPanorama(currentNodeId);
        console.log('Loaded hotspots:', hotspotsData.length);
        setHotspots(hotspotsData);
      } catch (error) {
        console.error('Error loading hotspots for panorama:', currentNodeId, error);
        setError('Gagal memuat hotspots');
      } finally {
        setLoading(false);
      }
    };

    loadHotspots();
  }, [currentNodeId]);

  // Update hotspots in viewer when hotspots data changes
  useEffect(() => {
    if (!viewer || !currentNodeId || loading) {
      console.log('Skipping hotspot update:', { 
        hasViewer: !!viewer, 
        currentNodeId, 
        loading 
      });
      return;
    }

    const markersPlugin = viewer.getPlugin('MarkersPlugin');
    if (!markersPlugin) return;

    // Clear existing hotspot markers
    try {
      const existingMarkers = markersPlugin.getMarkers();
      existingMarkers.forEach((marker: any) => {
        if (marker.id && marker.id.startsWith('hotspot-')) {
          markersPlugin.removeMarker(marker.id);
        }
      });
    } catch (error) {
      console.warn('Error clearing existing hotspot markers:', error);
    }

    // Add hotspot markers
    hotspots.forEach((hotspot) => {
      if (!hotspot.isVisible) return;

      try {
        const markerConfig = {
          id: `hotspot-${hotspot.id}`,
          position: hotspot.position,
          tooltip: {
            content: `
              <div class="hotspot-tooltip">
                <h3>${hotspot.title}</h3>
                <p>${hotspot.content}</p>
              </div>
            `,
            position: 'top'
          },
          size: { width: 32, height: 32 },
          anchor: 'bottom center',
          data: { 
            hotspotId: hotspot.id,
            type: hotspot.type,
            targetNodeId: hotspot.targetNodeId,
            hotspot: hotspot
          }
        };

        // Add custom styling if available
        if (hotspot.style) {
          if (hotspot.style.backgroundColor) {
            markerConfig.style = { backgroundColor: hotspot.style.backgroundColor };
          }
          if (hotspot.style.size) {
            markerConfig.size = { 
              width: hotspot.style.size, 
              height: hotspot.style.size 
            };
          }
          if (hotspot.style.icon) {
            markerConfig.image = hotspot.style.icon;
          }
        }

        // Default icon based on type
        if (!markerConfig.image) {
          switch (hotspot.type) {
            case 'info':
              markerConfig.image = '/icon/info.svg';
              break;
            case 'link':
              markerConfig.image = '/icon/link.svg';
              break;
            case 'custom':
              markerConfig.image = '/icon/custom.svg';
              break;
            default:
              markerConfig.image = '/icon/info.svg';
          }
        }

        markersPlugin.addMarker(markerConfig);
      } catch (error) {
        console.warn('Error adding hotspot marker:', error);
      }
    });

    // Add click event listener for hotspots
    const handleHotspotClick = ({ marker, doubleClick, rightClick }: any) => {
      if (marker.data && marker.data.hotspotId) {
        console.log('Hotspot clicked:', marker.data);
        
        // Handle different hotspot types
        switch (marker.data.type) {
          case 'info':
            // Show info modal
            setSelectedHotspot(marker.data.hotspot);
            setIsModalOpen(true);
            break;
          case 'link':
            // Navigate to target panorama
            if (marker.data.targetNodeId) {
              console.log('Navigate to:', marker.data.targetNodeId);
              setCurrentNode(marker.data.targetNodeId);
            }
            break;
          case 'custom':
            // Handle custom hotspot action
            console.log('Custom hotspot:', marker.data);
            // You can add custom logic here
            break;
        }
      }
    };

    // Add event listener
    markersPlugin.addEventListener('select-marker', handleHotspotClick);

    return () => {
      // Cleanup event listener
      markersPlugin.removeEventListener('select-marker', handleHotspotClick);
    };
  }, [hotspots, viewer, currentNodeId, loading, setCurrentNode]);

  // Show error if there's an error
  if (error) {
    console.error('Hotspot error:', error);
  }

  return (
    <>
      {/* Hotspot Info Modal */}
      <HotspotInfoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedHotspot(null);
        }}
        hotspot={selectedHotspot}
      />
    </>
  );
};

export default HotspotDisplay; 