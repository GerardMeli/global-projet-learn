// Polyfill `global` for libraries (e.g. sockjs-client) that expect a Node-like global
(window as any).global = window;

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { enableProdMode } from '@angular/core';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

enableProdMode();
