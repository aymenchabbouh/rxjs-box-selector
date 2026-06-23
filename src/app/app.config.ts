import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';

/**
 * Application-level configuration.
 * Using zoneless change detection as required by the spec.
 */
export const appConfig: ApplicationConfig = {
  providers: [provideExperimentalZonelessChangeDetection()]
};
