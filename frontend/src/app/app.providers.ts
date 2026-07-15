import { httpProviders } from './core/http/http.providers';
import { localeProviders } from './core/locale.providers';
import { appInitializerProviders } from './utilities/initializers/app-initializers';

export const appProviders = [
  ...httpProviders,
  ...localeProviders,
  ...appInitializerProviders,
];
