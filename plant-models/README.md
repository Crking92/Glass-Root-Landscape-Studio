# Shared plant assets — contract v1

Owners: botanical-model chat owns this directory and species-mesh-lab/. Studio chat owns studio-three.js and main editor. Coordinate before replacing the working Studio muhly generator.

## Realism review 02 — dense Lindheimer muhly flowerheads (lab 0.5.1)

- User-provided visual reference (Robert Perry credit visible) shows densely flowered cream-colored panicles. Used as a visual reference only; no image copied into repository. Existing Wildflower Center and Grass ID Lab citations retained. The contracted to somewhat opening panicle remains consistent with the documented regional-flora morphology.
- Mature maximum branch spread parameter reduced from 37 mm to 18 mm (not a measured botanical dimension); paired staggered short ascending branches with spikelets extending nearly to the branch base. High detail uses 24 branch levels × 2 branches × 4 spikelet shapes per head, versus 17 × 1 × 5 previously. Cream/silver palette, slightly enlarged fine geometry for landscape readability, young heads remain more contracted, dry heads remain pale straw. Culm and leaf geometry unchanged.
- Mature seed 42: 155,040 / 45,120 / 10,760 triangles (high/medium/low). 150 grass configurations passed finite matching buffer checks; all little bluestem and leafy muhly configurations matched previous position/normal/color buffers exactly. Sage generator and main editor untouched. Browser/deployment/visual review pending; no production approval.

## Realism review 01 — grasses and lab switching (lab 0.5)

- User screenshot showed autumn sage selected while the previous little bluestem title and geometry remained visible. The exact browser cause was not reproduced; stale cached registry or unhandled rebuild failure were plausible. Lab now requests versioned shared modules, uses exact stable palette IDs as selector values, uploads typed arrays directly, and clears the old mesh with an explicit diagnostic if a switch fails. Removed the distracting dark ground disk, improved neutral backdrop, close-up framing and preview shading. The lab still uses its existing raw WebGL preview, with Three.js-compatible shared assets; main scene lighting untouched.
- Revised unapproved grass prototypes using existing botanical research: denser leaf ribbons, varied brighter natural colors, wider basal silhouettes; little bluestem now has attached alternating lower culm leaves, more open individual stem arrangement and visible silky raceme hairs. Muhly retains its basal fountain and narrow-to-loosening elongated panicles; mature heads open somewhat further. Fine structures enlarged selectively for legibility; not an exact measured specimen. Prior geometry preserved in Git history (grass blob `2d64f1ce35d1e3f76ac691e394759572a59efe35`). Sage geometry unchanged.
- Mature seed 42 revised triangle counts: muhly 125,248 / 36,780 / 9,200; little bluestem 150,912 / 41,936 / 9,912; sage 181,662 / 59,766 / 13,568 (high/medium/low). All 225 normalized configurations passed finite buffer, matching attribute and bounds checks. Simulated DOM/GPU switching p0→p6→p1→p6→p0 and invalid-ID clearing/recovery passed, including expected triangle counts. Browser/cache/GPU behavior and visual quality still need live review; no promotion to production approved. No main editor files modified.

## Advanced botanical realism batch 01 — Autumn sage (lab 0.4)

- Added original `autumn-sage.js`, existing palette ID `p6` / Salvia greggii, status **prototype**, not production approved. Existing grass geometry remains unchanged. Studio's opt-in registry consumer exists; actual appearance in Studio and lab is pending browser review.
- Primary: [Lady Bird Johnson Wildflower Center SAGR4](https://www.wildflower.org/plants/result.php?id_plant=SAGR4), checked 2026-11-26: mounding shrub, opposite simple elliptic/obovate leaves, rounded tips, variable entire to finely serrulate margins, terminal racemes, red usually prevalent in wild; evergreen/semi-evergreen in warm climates. Palette currently says deciduous; no palette changes, dry preview retains approximately 75% of modeled leaf nodes, not a universal winter prediction.
- Supplement: [A. C. Gibson, Vascular Plants of Williamson County, Salvia greggii](https://w3.biosci.utexas.edu/prc/K12/pdf/Salvia%20greggii): multistem woody base, decussate leaves (8–48 × 3–22 mm), terminal paired flowers, ~25 mm bilateral corolla, hood and broad three-lobed lower lip, ribbed reddish calyx. Model uses tapered branches, clustered axillary leaves, 16–36 mm principal leaf lengths, separate tubular flowers/buds, red with subtle variation, no cultivar claim. Nutlets, microscopic glands, precise calyx ribs and marginal teeth not represented; dry calyx-like structures are stylized. No new county-level nativity verification.
- Five seeds, five appearance states, three detail levels. Leafy = no flowers; young = early flowering; mature/fall = stronger flowering; dry = reduced foliage, illustrative persistent calyces. Same seeded overall framework, density varies by LOD. Geometry is not a calendar forecast or a diagnostic voucher. Per-stage normalization retains existing contract.
- Final mature seed 42: 181,662 / 59,766 / 13,568 triangles (high/medium/low). High is a close-up prototype; lower modes need further performance review for mass planting. No mass proxy yet. All 225 configurations across three species validated normalized finite arrays, matching attribute lengths, bounded colors and dimensions. Sage seed repeatability, variation, exact ID/name match and lab script syntax passed. Actual WebGL/Three.js appearance, frame rate, deployment and user approval unverified.
- Changes confined to plant-models/ and species-mesh-lab/; main editor, studio-three.js, root README and palette untouched per cross-chat scope. Main conversation can update root release summary when coordinating integration.

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

Stages: leafy, young, mature, fall, dry; illustrative, not calendar phenology. Detail: high, medium, low. Mass proxy not supplied yet; retain Studio's existing fallback for mass scenes. Seed is uint32; lab exposes five fixed seeds. Registry exact scientific names and palette IDs: p1 Muhlenbergia lindheimeri, p0 Schizachyrium scoparium, p6 Salvia greggii. Unknown keys return null from findPlantModel and throw from buildPlantModel. All three species are prototypes, not production approved. Studio has an opt-in shared registry comparison path; browser review is pending. Source notes remain in lab and registry; no source photos copied, no new county nativity decision.

## Handoff and tests

The exact prior lab generator was extracted without geometry changes. Lab imports the shared registry and requests meter/display RGB geometry, retaining its existing native WebGL viewer. Studio retains its own default rendering and has an opt-in shared registry comparison path; do not claim default production integration until the other chat coordinates promotion and visual review. Suggested integration: use exact ID/name lookup, prototype gate, normalized geometry adapter, species-specific bucket key, and existing mass fallback; preserve project dimensions and classic view. Keep shared model geometry and production scene lighting separate.

Verified 150 combinations of 2 species × 5 states × 3 detail levels × 5 seeds for finite buffers, matched lengths, linear colors and normalized bounds. Three.js adapter tested with simulated BufferGeometry/BufferAttribute classes, not a real Three.js browser session. Existing lab geometry preserved; actual browser deployment and visual quality remain unverified. Future work: Three.js lab viewer, mass proxies, lower triangle budgets, source-backed new species, real visual review.
