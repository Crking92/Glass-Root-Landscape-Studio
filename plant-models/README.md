# Shared plant assets — contract v1

Owners: botanical-model chat owns this directory and species-mesh-lab/. Studio chat owns studio-three.js and main editor. Coordinate before replacing the working Studio muhly generator.

## Consumer API

```js
import {findPlantModel, buildPlantModel, createPlantGeometry, plantModels} from './plant-models/registry.js';
const model = findPlantModel('p1'); // or exact scientific name
const geometry = createPlantGeometry(THREE, model.id, {
  seed: 42, stage: 'mature', detail: 'medium'
});
// Geometry is normalized by default. Scale to saved object dimensions in feet:
// mesh.scale.set(object.w, object.height, object.w);
// Material: white, vertexColors:true, side:THREE.DoubleSide.
// Dispose and reuse geometry in the Studio's existing instancing pipeline.
```

Use the caller's pinned Three.js r180 namespace. The generator itself has no engine dependency. Returned attributes are non-indexed Float32Array positions, normals and colors, three components each. Coordinates are Y-up, origin at the base. Default buildPlantModel units are meters; createPlantGeometry defaults to normalized spread and height. Normalization uses twice maximum absolute horizontal coordinate and maximum Y, with inverse-transpose normal correction. It fits the supplied stage/detail bounds independently; visual state changes can therefore alter relative foliage proportions in a fixed-height project instance. Linear sRGB vertex colors default for Three.js; display RGB preserves the old raw WebGL preview. Do not normalize or convert colors twice.

Stages: leafy, young, mature, fall, dry; illustrative, not calendar phenology. Detail: high, medium, low. Mass proxy not supplied yet; retain Studio's existing fallback for mass scenes. Seed is uint32; lab exposes five fixed seeds. Registry exact scientific names and palette IDs: p1 Muhlenbergia lindheimeri, p0 Schizachyrium scoparium. Unknown keys return null from findPlantModel and throw from buildPlantModel. Both species are prototypes, not approved or integrated. Source notes remain in lab and registry; no source photos copied, no new county nativity decision.

## Handoff and tests

The exact prior lab generator was extracted without geometry changes. Lab imports the shared registry and requests meter/display RGB geometry, retaining its existing native WebGL viewer. Studio still uses its own existing code; do not claim shared production integration until the other chat wires it in and reviews visuals. Suggested integration: use exact ID/name lookup, prototype gate, normalized geometry adapter, species-specific bucket key, and existing mass fallback; preserve project dimensions and classic view. Keep shared model geometry and production scene lighting separate.

Verified 150 combinations of 2 species × 5 states × 3 detail levels × 5 seeds for finite buffers, matched lengths, linear colors and normalized bounds. Three.js adapter tested with simulated BufferGeometry/BufferAttribute classes, not a real Three.js browser session. Existing lab geometry preserved; actual browser deployment and visual quality remain unverified. Future work: Three.js lab viewer, mass proxies, lower triangle budgets, source-backed new species, real visual review.
