'use client';

import React from 'react';
import { usePlugins } from '../lib/plugins/context';
import { PluginSlot as SlotType } from '../lib/plugins/types';

interface PluginSlotProps {
    name: SlotType;
    [key: string]: any; // Allow passing extra props to the plugin component
}

export function PluginSlot({ name, ...props }: PluginSlotProps) {
    const { plugins } = usePlugins();

    return (
        <div className={`plugin-slot plugin-slot-${name}`} data-slot={name}>
            {plugins.map(plugin => {
                const Component = plugin.components?.[name];

                if (!Component) {
                    return null;
                }

                return (
                    <div key={plugin.id} className="plugin-component-wrapper">
                        <Component {...props} />
                    </div>
                );
            })}
        </div>
    );
}
