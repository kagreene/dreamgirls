/// <reference types="vite/client" />

interface ImportMeta {
    readonly env: {
      readonly VITE_MAPBOX_TOKEN: string;
      readonly VITE_APP_API_URL?: string; // Optional API URL if you're configuring it
      readonly MODE: string;
      readonly DEV: boolean;
      readonly PROD: boolean;
      readonly SSR: boolean;
      // // Add any other environment variables you might use
      [key: string]: string | undefined;
    };
  }