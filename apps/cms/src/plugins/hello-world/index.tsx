import React from 'react';
import { ClientPlugin } from '@/lib/plugins/types';

// The UI Component
function HelloWorldComponent() {
    return (
        <div className="p-4 my-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
            <h3 className="font-bold">Hello from Plugin!</h3>
            <p className="text-sm">This component is injected via the Plugin System.</p>
        </div>
    );
}

// The Plugin Definition
export const HelloWorldPlugin: ClientPlugin = {
    id: 'hello-world',
    name: 'Hello World Plugin',
    description: 'A demo plugin showing how to inject UI components.',
    components: {
        'footer-main': HelloWorldComponent,
    },
    onLoad: () => {
        console.log('Hello World Plugin has been loaded!');
    }
};
