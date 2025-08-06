import React, { useState, useRef, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { useEditorStore } from '../../../../store/editorStore';
import { 
    Upload, 
    ZoomIn, 
    ZoomOut, 
    Move, 
    RotateCcw, 
    Grid,
    Image,
    MapPin,
    Trash2,
    Settings
} from 'lucide-react';
import Button from '../../../common/Button';
import OptimizedImage from '../../../common/OptimizedImage';

interface MinimapNode {
    id: string;
    panoramaId: string;
    x: number;
    y: number;
    size: number;
    rotation: number;
    label: string;
}

const MinimapEditor: React.FC = () => {
    const { setCurrentPanorama } = useEditorStore();
    const [floorplanImage, setFloorplanImage] = useState<string | null>(null);
    const [nodes, setNodes] = useState<MinimapNode[]>([]);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);

    // Drop zone for panoramas
    const [{ isOver }, drop] = useDrop({
        accept: 'PANORAMA',
        drop: (item: any, monitor) => {
            const offset = monitor.getClientOffset();
            if (offset && canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                const x = (offset.x - rect.left - pan.x) / zoom;
                const y = (offset.y - rect.top - pan.y) / zoom;
                
                const newNode: MinimapNode = {
                    id: `node-${Date.now()}`,
                    panoramaId: item.panorama.id,
                    x,
                    y,
                    size: 60,
                    rotation: 0,
                    label: item.panorama.name
                };
                
                setNodes(prev => [...prev, newNode]);
                setSelectedNode(newNode.id);
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFloorplanImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button === 0) { // Left click
            setIsDragging(true);
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }
    }, [pan]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging) {
            setPan({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    }, [isDragging, dragStart]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleNodeClick = (nodeId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedNode(nodeId);
    };

    const handleNodeDrag = (nodeId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left - pan.x) / zoom;
            const y = (e.clientY - rect.top - pan.y) / zoom;
            
            setNodes(prev => prev.map(node => 
                node.id === nodeId ? { ...node, x, y } : node
            ));
        }
    };

    const handleZoom = (delta: number) => {
        setZoom(prev => Math.max(0.1, Math.min(3, prev + delta)));
    };

    const handleReset = () => {
        setPan({ x: 0, y: 0 });
        setZoom(1);
    };

    const deleteNode = (nodeId: string) => {
        setNodes(prev => prev.filter(node => node.id !== nodeId));
        if (selectedNode === nodeId) {
            setSelectedNode(null);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => document.getElementById('floorplan-upload')?.click()}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <Upload className="w-4 h-4 mr-1" />
                        Upload Floorplan
                    </Button>
                    <input
                        id="floorplan-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    
                    {floorplanImage && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFloorplanImage(null)}
                            className="text-red-600 hover:text-red-700"
                        >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                        </Button>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleZoom(-0.1)}
                        disabled={zoom <= 0.1}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-600 min-w-[60px] text-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleZoom(0.1)}
                        disabled={zoom >= 3}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <Grid className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Canvas */}
            <div 
                ref={drop}
                className="flex-1 relative overflow-hidden bg-gray-100"
            >
                <div
                    ref={canvasRef}
                    className={`w-full h-full relative ${
                        isDragging ? 'cursor-grabbing' : 'cursor-grab'
                    }`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {/* Floorplan Background */}
                    {floorplanImage && (
                        <div
                            className="absolute inset-0"
                            style={{
                                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                                transformOrigin: '0 0'
                            }}
                        >
                            <OptimizedImage
                                src={floorplanImage}
                                alt="Floorplan"
                                className="w-full h-full object-cover"
                                priority={true}
                            />
                        </div>
                    )}

                    {/* Nodes */}
                    {nodes.map((node) => (
                        <div
                            key={node.id}
                            className={`absolute cursor-move transition-all ${
                                selectedNode === node.id ? 'ring-2 ring-blue-500' : ''
                            }`}
                            style={{
                                left: node.x,
                                top: node.y,
                                transform: `translate(-50%, -50%) scale(${zoom}) rotate(${node.rotation}deg)`,
                                width: node.size,
                                height: node.size
                            }}
                            onClick={(e) => handleNodeClick(node.id, e)}
                            onMouseDown={(e) => handleNodeDrag(node.id, e)}
                        >
                            <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium shadow-lg border-2 border-white">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                {node.label}
                            </div>
                        </div>
                    ))}

                    {/* Drop Zone Overlay */}
                    {isOver && !floorplanImage && (
                        <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-75 z-10">
                            <div className="text-center">
                                <Image className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                                <p className="text-blue-700 font-medium">
                                    Drop panorama here to add to minimap
                                </p>
                                <p className="text-blue-600 text-sm mt-1">
                                    Upload a floorplan first for better positioning
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!floorplanImage && nodes.length === 0 && !isOver && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No Floorplan Uploaded
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    Upload a floorplan image to start creating your minimap
                                </p>
                                <Button
                                    onClick={() => document.getElementById('floorplan-upload')?.click()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Floorplan
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Node Properties (when selected) */}
            {selectedNode && (
                <div className="bg-white border-t border-gray-200 p-3">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">Node Properties</h4>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNode(selectedNode)}
                            className="text-red-600 hover:text-red-700"
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Size</label>
                            <input
                                type="range"
                                min="20"
                                max="100"
                                value={nodes.find(n => n.id === selectedNode)?.size || 60}
                                onChange={(e) => {
                                    setNodes(prev => prev.map(node => 
                                        node.id === selectedNode 
                                            ? { ...node, size: parseInt(e.target.value) }
                                            : node
                                    ));
                                }}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Rotation</label>
                            <input
                                type="range"
                                min="0"
                                max="360"
                                value={nodes.find(n => n.id === selectedNode)?.rotation || 0}
                                onChange={(e) => {
                                    setNodes(prev => prev.map(node => 
                                        node.id === selectedNode 
                                            ? { ...node, rotation: parseInt(e.target.value) }
                                            : node
                                    ));
                                }}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MinimapEditor; 