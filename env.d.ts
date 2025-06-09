/// <reference types="vite/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly VITE_APP_TITLE: string;
    // Add other environment variables here
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};
