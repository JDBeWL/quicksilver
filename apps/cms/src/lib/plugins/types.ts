import { ReactNode } from 'react';

// Define available UI slots in the application
export type PluginSlot =
    | 'sidebar-top'
    | 'post-footer'
    | 'post-sidebar'
    | 'navbar-end'
    | 'admin-dashboard'
    | 'footer-main';

// A client plugin defines components for slots
export interface ClientPlugin {
    id: string;
    name: string;
    description?: string;
    // Map slots to React components
    components?: Partial<Record<PluginSlot, React.ComponentType<any>>>;
    // Lifecycle hooks
    onLoad?: () => void;
}

// Registry definition
export interface PluginRegistry {
    [key: string]: ClientPlugin;
}
