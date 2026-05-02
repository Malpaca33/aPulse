globalThis.process ??= {}; globalThis.process.env ??= {};
import './chunks/astro-designed-error-pages_C5-iSHav.mjs';
import './chunks/astro/server_BbF_25Bn.mjs';
import { s as sequence } from './chunks/index_DyC9zPbI.mjs';

const onRequest$1 = (context, next) => {
  if (context.isPrerendered) {
    context.locals.runtime ??= {
      env: process.env
    };
  }
  return next();
};

const onRequest = sequence(
	onRequest$1,
	
	
);

export { onRequest };
