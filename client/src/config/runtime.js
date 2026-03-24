const demoFlag = String(import.meta.env.VITE_DEMO_MODE || '').toLowerCase();

export const useDemoMode = demoFlag === 'true';
