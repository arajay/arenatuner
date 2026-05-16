import { render as rtlRender, RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';

export function render(ui: ReactElement, options?: RenderOptions) {
    return rtlRender(ui, options);
}

export * from '@testing-library/react';
