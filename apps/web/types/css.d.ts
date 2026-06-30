// Allow side-effect CSS imports (e.g. import 'mapbox-gl/dist/mapbox-gl.css')
// TypeScript 6 is stricter about non-TS module imports; this shim declares all .css files as valid modules.
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
