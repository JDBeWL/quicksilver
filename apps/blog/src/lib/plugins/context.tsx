'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ClientPlugin } from './types';
import { registry } from './registry';

interface PluginContextType {
    plugins: ClientPlugin[];
    loading: boolean;
    error: string | null;
}

const PluginContext = createContext<PluginContextType>({
    plugins: [],
    loading: false,
    error: null,
});

export function usePlugins() {
    return useContext(PluginContext);
}

export function PluginProvider({ children }: { children: ReactNode }) {
    const [plugins, setPlugins] = useState<ClientPlugin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            // In a real app, you might fetch enabled plugins from an API
            // For now, we load all plugins available in the registry
            const enabledPlugins = Object.values(registry) as ClientPlugin[];

            // Execute onLoad hooks
            enabledPlugins.forEach(plugin => {
                if (plugin.onLoad) {
                    try {
                        plugin.onLoad();
                    } catch (e) {
                        console.error(`Error in onLoad for plugin ${plugin.id}:`, e);
                    }
                }
            });

            setPlugins(enabledPlugins);
        } catch (err) {
            console.error('Failed to load plugins:', err);
            setError('Failed to initialize plugins');
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <PluginContext.Provider value={{ plugins, loading, error }}>
            {children}
        </PluginContext.Provider>
    );
}
