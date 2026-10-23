import { register } from 'node:module';
import './shims.mjs';
import './quiet.mjs';
register('./hooks.mjs', import.meta.url);
