import { PluginRegistry } from './types';
import { HelloWorldPlugin } from '../../plugins/hello-world';
import { SearchBoxPlugin } from '../../plugins/search-box';
import { TocPlugin } from '../../plugins/toc';

export const registry: PluginRegistry = {
    // 'hello-world': HelloWorldPlugin,
    'search-box': SearchBoxPlugin,
    'toc': TocPlugin,
};
