import { supabase } from '../lib/supabase';
import panoramaData from '../data/panorama-data.json';

// Mapping textureX/textureY ke yaw/pitch yang sesuai
const textureToSpherical = (textureX: number, textureY: number) => {
    // Mapping yang sesuai dengan kebutuhan markers navigasi
    const yaw = (textureX / 4096) * 2 * Math.PI - Math.PI;
    const pitch = (textureY / 2048) * Math.PI - Math.PI / 2;
    return { yaw, pitch };
};

// Get panorama ID by name from database
const getPanoramaIdByName = async (name: string): Promise<string | null> => {
    const { data, error } = await supabase
        .from('panoramas')
        .select('id')
        .eq('name', name)
        .single();

    if (error) {
        console.error('Error getting panorama ID:', error);
        return null;
    }

    return data?.id || null;
};

// Get target panorama name by nodeId
const getTargetPanoramaName = (nodeId: string): string => {
    const targetNode = panoramaData.find(node => node.id === nodeId);
    return targetNode?.name || `Panorama ${nodeId}`;
};

// Migrate markers to hotspots
export const migrateMarkersToHotspots = async (): Promise<{ success: boolean; message: string }> => {
    try {
        console.log('Starting migration of markers to hotspots...');

        // Clear existing hotspots first
        const { error: deleteError } = await supabase
            .from('hotspots')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (deleteError) {
            console.error('Error clearing existing hotspots:', deleteError);
            return { success: false, message: `Error clearing hotspots: ${deleteError.message}` };
        }

        console.log('Cleared existing hotspots');

        let migratedCount = 0;
        const errors: string[] = [];

        // Process each panorama
        for (const panorama of panoramaData) {
            console.log(`Processing panorama: ${panorama.name}`);

            // Get panorama ID from database
            const panoramaId = await getPanoramaIdByName(panorama.name);
            if (!panoramaId) {
                const errorMsg = `Panorama not found in database: ${panorama.name}`;
                console.warn(errorMsg);
                errors.push(errorMsg);
                continue;
            }

            // Process markers for this panorama
            if (panorama.markers && panorama.markers.length > 0) {
                for (const marker of panorama.markers) {
                    try {
                        // Convert textureX/textureY to yaw/pitch
                        const { yaw, pitch } = textureToSpherical(
                            marker.position.textureX,
                            marker.position.textureY
                        );

                        // Get target panorama name
                        const targetPanoramaName = getTargetPanoramaName(marker.nodeId);

                        // Insert hotspot
                        const { error: insertError } = await supabase
                            .from('hotspots')
                            .insert({
                                panorama_id: panoramaId,
                                position_yaw: yaw,
                                position_pitch: pitch,
                                type: 'link',
                                title: `Pindah ke ${targetPanoramaName}`,
                                content: `Klik untuk pindah ke panorama ${targetPanoramaName}`,
                                target_node_id: marker.nodeId,
                                is_visible: true,
                                style: {
                                    backgroundColor: '#007bff',
                                    size: 40,
                                    icon: '/icon/door-open.svg'
                                }
                            });

                        if (insertError) {
                            const errorMsg = `Error inserting hotspot for ${panorama.name}: ${insertError.message}`;
                            console.error(errorMsg);
                            errors.push(errorMsg);
                        } else {
                            migratedCount++;
                            console.log(`Migrated marker to hotspot: ${panorama.name} -> ${marker.nodeId}`);
                        }
                    } catch (error) {
                        const errorMsg = `Error processing marker in ${panorama.name}: ${error}`;
                        console.error(errorMsg);
                        errors.push(errorMsg);
                    }
                }
            }
        }

        console.log(`Migration completed. Migrated ${migratedCount} markers to hotspots.`);
        
        if (errors.length > 0) {
            console.warn(`Migration completed with ${errors.length} errors:`, errors);
            return {
                success: true,
                message: `Migration completed with ${migratedCount} hotspots migrated. ${errors.length} errors occurred.`
            };
        }

        return {
            success: true,
            message: `Successfully migrated ${migratedCount} markers to hotspots.`
        };

    } catch (error) {
        console.error('Migration error:', error);
        return {
            success: false,
            message: `Migration failed: ${error}`
        };
    }
};

// Get hotspots for a panorama
export const getHotspotsForPanorama = async (panoramaId: string) => {
    const { data, error } = await supabase
        .from('hotspots')
        .select('*')
        .eq('panorama_id', panoramaId)
        .eq('is_visible', true)
        .order('created_at');

    if (error) {
        console.error('Error fetching hotspots:', error);
        return [];
    }

    return data || [];
};

// Add new hotspot
export const addHotspot = async (panoramaId: string, hotspotData: any) => {
    const { data, error } = await supabase
        .from('hotspots')
        .insert({
            panorama_id: panoramaId,
            position_yaw: hotspotData.yaw,
            position_pitch: hotspotData.pitch,
            type: hotspotData.type || 'link',
            title: hotspotData.title,
            content: hotspotData.content,
            target_node_id: hotspotData.target_node_id,
            is_visible: hotspotData.is_visible !== false,
            style: hotspotData.style
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding hotspot:', error);
        throw error;
    }

    return data;
};

// Update hotspot
export const updateHotspot = async (hotspotId: string, updates: any) => {
    const { data, error } = await supabase
        .from('hotspots')
        .update(updates)
        .eq('id', hotspotId)
        .select()
        .single();

    if (error) {
        console.error('Error updating hotspot:', error);
        throw error;
    }

    return data;
};

// Delete hotspot
export const deleteHotspot = async (hotspotId: string) => {
    const { error } = await supabase
        .from('hotspots')
        .delete()
        .eq('id', hotspotId);

    if (error) {
        console.error('Error deleting hotspot:', error);
        throw error;
    }

    return true;
}; 