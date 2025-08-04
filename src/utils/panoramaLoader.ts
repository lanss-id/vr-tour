import panoramaData from '../data/panorama-data.json';
import { PanoramaNode } from '../types/panorama';

export const getPanoramaById = (id: string): PanoramaNode | undefined => {
  return panoramaData.find(node => node.id === id);
};

export const getPanoramasByCategory = (category: string): PanoramaNode[] => {
  return panoramaData.filter(node => node.category === category);
};

export const getAllPanoramas = (): PanoramaNode[] => {
  return panoramaData;
};

export const getConnectedPanoramas = (nodeId: string): PanoramaNode[] => {
  const node = getPanoramaById(nodeId);
  if (!node) return [];

  return node.links
    .map(link => getPanoramaById(link.nodeId))
    .filter(Boolean) as PanoramaNode[];
};

export const getCategories = () => {
  const categories = new Set(panoramaData.map(node => node.category).filter(Boolean));
  return Array.from(categories);
};

export const validatePanoramaData = (data: any[]): boolean => {
  return data.every(node =>
    node.id &&
    node.panorama &&
    node.name &&
    Array.isArray(node.links) &&
    Array.isArray(node.gps) &&
    node.gps.length === 2
  );
};
