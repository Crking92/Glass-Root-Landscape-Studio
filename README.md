# Glass Root Landscape Studio v0.9.5

Free, independent, stylized landscape concept editor. [Open the web app](https://crking92.github.io/Glass-Root-Landscape-Studio/). No installation, external libraries, network API requests, accounts, or paid assets are required. All plant symbols are original procedural drawings. The 3D concept view is an orthographic projection, not a photorealistic mesh renderer.

## Experimental 3D Plant Library (mesh lab 0.2)
- [Open the independent WebGL plant library](https://crking92.github.io/Glass-Root-Landscape-Studio/species-mesh-lab/). Two original species-specific prototypes: Lindheimer's muhly and little bluestem, five seeded individuals, five illustrative appearances, three detail levels, orbit and zoom. No external dependencies or copied photos.
- Wildflower Center primary profiles and read-only Hays Botany Poaceae Grass ID Lab records inform visible morphology; species-level artistic geometry is not an identification key. Source links are shown for each species. No variety, cultivar or county-level nativity claim added.
- Mesh generator checks: 150 species × stage × detail × individual combinations (2 × 5 × 3 × 5), finite matching position/normal/color arrays and deterministic seed variation. Mature individual 01 plant triangles: muhly 119,800 / 37,140 / 9,000; little bluestem 123,828 / 36,184 / 9,052 (high/medium/low). Ground shading is illustrative; no real cast shadows. Browser visual/performance testing and main editor integration remain pending. Main editor and saved projects unchanged.

## Getting started
- Click Example to explore a sample design, or New to start blank.
- Use 2D plan for drawing. Place plants, draw buildings and rectangular paths using two opposite corners, and measure with two clicks.
- Select Draw bed / surface, choose a material, click corners, then Finish shape or Enter. Enable Smooth new bed corners to round the outline; selected beds can also be smoothed afterward. The calculated area follows the rounded outline.
- Draw lot boundary creates a custom visual lot outline and reports its area. Reset lot boundary removes it. The width/depth fields control the rectangular drawing canvas. The boundary does not clip or prohibit object placement.
- Set snapping to off, 6 inches, 1 foot, or 5 feet. Use Select / move to drag, edit, duplicate, or delete objects.
- Choose mulch, gravel, concrete, decomposed granite, grass, or bare soil for new surfaces or edit the material of a selected surface. Surface quantities are summed individually; overlaps are not deducted. Mulch volume = area (sq ft) × depth (in) / 324, before waste allowance.
- Space + drag or middle mouse pans; wheel zooms. Switch to 3D concept and rotate the view.

## Naturalistic plant graphics (v0.9.5.1)
- Replaces glossy round tree/shrub clusters with overlapping irregular matte foliage masses, restrained directional shading and fine leaf-shaped texture. Woody branches taper and fork; trunk segments bend, with small root flares and bark shading. Broad canopy, airy, upright and conifer forms retain different proportions.
- Increases grass blade density at high detail; adds illustrative side-facing grama spikes and finer branching muhly seedhead shapes. Petals have tapered contours and textured centers. Soft contact shadows use a continuous radial fade instead of concentric rings.
- Independent deterministic crown seeds reduce seasonal changes to branch structure. Graphics are still artistic interpretations, not verified species-level models. The source library, dimensions, ecology, 2D plan and saved designs are unchanged.
- Adaptive detail and on-screen size limits reduce foliage work. All 315 taxa and 19 styles were exercised in three seasonal states using simulated Canvas calls, with no nonfinite coordinates, stable repeat rendering and orbit-dependent projection. Final texture-density optimization was syntax checked; real browser visual quality and frame rate remain to be verified.
- Buildings, hardscape and material textures are intentionally unchanged in this pass.

## Detailed plant graphics (v0.9.5)
- Plant detail above the canvas offers Simple (previous renderer), Standard and Detailed (default). The detailed 3D renderer constructs original procedural plant geometry from normalized three-dimensional branch, leaf, blade and flower positions, projects it through the existing camera, and sorts parts by approximate depth. Foliage clusters use layered shading, with gradients at the highest detail level. Soft contact shadows are illustrative, not calculated sunlight.
- Nineteen visual styles cover the 315 existing taxa: spreading, airy, upright and conifer-like trees; shrubs; upright, arching, strap-leaf and muhly-like grasses; daisy, spike, cluster and other flowering herbs; pads, rosettes and spiky rosettes; ferns, vines and groundcovers. Genus-based style choices and procedural forms are artistic approximations, not verified botanical morphology. Existing source data, IDs, dimensions, palette, ecology, Wildflower Center references and seasonal controls remain unchanged.
- Each object has a deterministic visual seed, so repeated renders retain its form. Plant detail automatically reduces for small on-screen plants and large projects; zooming in increases available detail. The 2D plan and report symbols remain unchanged. The renderer is still a stylized orthographic Canvas scene, not a mesh-based photorealistic engine, and object occlusion is approximate.
- Simulated rendering checks cover all 315 taxa in three seasonal states (945 plant renders), all 19 styles, deterministic repeated rendering, orbit-dependent projection, simple/standard/detailed paths, large-scene level selection and unchanged saved geometry. Visual quality and frame rate in an actual browser are not yet verified.
- Next: improve building models, hardscape, material textures and presentation; insect dataset integration (v0.9.3) remains on hold. Keep all graphics original and avoid paid dependencies.

## Drawing and group editing (v0.9.4)
- Draw curved path: choose material, width (0.5–100 ft), and optional centerline smoothing; click 2–100 centerline points in 2D, then Finish shape or Enter. A translucent width preview follows the draft. The resulting polygon has mitered offset edges and flat ends; tight turns, crossed outlines, and paths outside the canvas are rejected. It is stored as an editable surface outline, not a parametric path; changing the width later requires redrawing or editing the outline. Areas flow into material totals and proposals. Curved paths are not mass-planting targets and act as obstacles when avoidance is enabled.
- Edit shape corners: choose a bed, curved path, water feature or property boundary from the shape selector, or select a bed and click Edit corners. Drag handles; Add corner inserts near an edge; Remove corner removes the selected handle. At least three vertices must remain. Self-crossing and out-of-canvas drag positions are rejected. For smoothed beds, handles are on the underlying polygon. The edits do not move plants that were previously installed.
- Select plant group: drag a rectangle around plant centers. Drag inside the resulting selection box to move all selected plants together (centers remain within the design canvas). Shift-drag starts a new selection. Duplicate offsets selected plants by 3 ft in both axes; Delete requires confirmation. Each mutation is one undo operation. Groups are temporary selections, not permanent project layers, and do not include hardscape or beds. Editing is in 2D.
- Simulated tests cover 80 sq ft straight path geometry, rounded paths, invalid reversal, report area, bed and boundary corner dragging, insert/delete, two-plant box selection, movement, duplication, deletion and undo, and project compatibility. Live browser interaction and visual testing are still needed.

## Seasonal graphics and advanced plant filters (v0.9.1–0.9.2)
- The Lady Bird Johnson Wildflower Center is the primary botanical reference for plant information and future botanical verification. Preserve the existing 315-record Target Zone Plant List and its profile URLs; this release does not independently reverify all source traits against the Center. Keep county nativity verification separate.
- Original procedural illustrations now use eleven visual templates across the existing eight growth-form categories, including conical and spreading tree concepts, upright and arching grasses, cactus pads, rosettes, ferns and flowering herbs. Template assignments and winter colors are graphic conventions rather than verified species-specific morphology.
- The Season selector offers an all-season view and twelve months. In 3D, visible blooms use the source calendar and palette where supported by the template; documented deciduous trees and shrubs are rendered leafless in winter as a conceptual convention. Winter grass color is illustrative. Five records have no foliage field and no deciduous status is inferred for them. Small symbols use simplified rendering. Camera and geometry remain unchanged; print plans retain the standard 2D representation.
- Advanced palette filters include light, source water/moisture terms, month, bloom color, foliage, maximum default concept height and evidence flags. Filters combine with name search and growth form. The height filter uses library default dimensions, including flagged placeholders. Ecology nectar-gap buttons reset palette filters and select nectar-listed taxa for the relevant month; these are candidates, not planting prescriptions.
- The Ecology panel provides prominent links to the Wildflower Center, Target Zone Plant List, Texas Lepidoptera Dashboard, host-plant research and specialist bee research. Full insect dataset integration (v0.9.3) is explicitly deferred; existing genus-level bee summaries and evidence flags remain unchanged.
- Simulated tests cover all 315 records, all eleven templates, twelve monthly views plus all-season, leafless/evergreen conventions, exact shade filtering, nectar-gap navigation, reset, proposal compatibility and unchanged project geometry. Live visual testing is pending.

## Ecological analysis
- Click Ecology to see live design summaries: plant quantity, distinct taxa and families, dominant taxon share, growth forms, source water categories, monthly flowering and nectar-listed taxon coverage, larval-host and bird-use flags, and specialist bee genus associations. The optional ecological proposal summary uses the same calculations.
- Target Zone Plant List snapshot: `40c60770f070511d61b15fc7ba03977acdb2104d`. All 315 records have parsable bloom months; 112 are nectar-flagged, 97 have a larval host entry, and 29 have a bird-use entry. These are source-field presence flags, not independently verified interactions.
- Bee summary: per-genus distinct bee counts from unqualified genus-level, Texas-listed pollen-host records in Central-Texas-Bee-Relationships snapshot `31512a931a1555a0c12fc9d8ee8a0c666111cde9` (Fowler 2020, https://jarrodfowler.com/bees_pollen.html). 90 plant taxa share 54 matched genera. No copied source prose, full bee relationship dataset, or photographs. Counts are non-additive; genus matches are not species-level host evidence. Texas listing is not county occurrence. The existing Texas Lepidoptera Dashboard remains linked, not fully integrated.
- Export ecology CSV for plant-level evidence fields. Missing evidence is not evidence of absence. Bloom counts are distinct taxa, not bloom abundance or nectar volume. Source water categories are not irrigation estimates. No new BONAP verification, county occurrence intersection, predicted insect richness or ecological score.
- Simulated tests cover empty design, duplicate plant counts, genus deduplication, bloom counts, report option and backward compatibility. Actual browser visual and print testing remain pending.

## Professional deliverables
- Click Print / proposal in the header to open the report editor. Enter project title, optional client and site, prepared-by name (defaults to Glass Root Garden), and installation/scope notes. The plan is generated north-up independently of camera position.
- The print plan includes a scale bar, boundary, surfaces, hardscape footprints and plant circles. Optional species numbers match an alphabetical planting schedule; optional aerial background includes provider attribution. Dense planting symbols may overlap and out-of-canvas objects are clipped on the plan (but counted in the schedules).
- Materials, hardscape, water-feature footprints and plants are summarized from current geometry. Mulch uses cubic yards at editable depth; other surfaces use horizontal square footage; linear fences/walls use feet. Overlaps are counted separately.
- Enter your own unit prices and optional additional labor/other amount. Blank prices remain unpriced, and partial estimates are clearly labeled. No tax, waste, delivery, supplier quotes or automatic labor assumptions. Quantities and prices are not construction specifications.
- Print / Save PDF opens the browser's print dialog with a light, letter-sized report; choose Save as PDF if desired. Export estimate CSV for spreadsheet work. Save report details commits the report fields and prices to the current project (undoable); Save project JSON backs up these fields. No client information is sent to a server.
- The report calculation, species numbering, HTML escaping, project preservation, report persistence and undo/redo were tested in a simulated interface. Actual browser print pagination and PDF appearance still need visual verification.

## GIS imagery improvements
- New sites start at a 600-ft overview; existing geographic sites retain their exact extent. Use 600-ft overview, 250-ft lot, or zoom-in/out buttons, then load preview. Source selection includes public Central Texas 2020 regional orthoimagery, USGS NAIP Plus, Texas NAIP 2022 and original USGS NAIP.
- Fast preview requests 600 pixels on the longest side; detailed requests 1,200. Native ground resolution still limits sharpness. Identical requests are cached for the current session; imagery requests time out after 15 seconds. Select a different source if coverage or latency is poor.
- Update current site imagery replaces the background only when geographic center and dimensions match, retaining objects and boundary. Attribution is preserved by source. Source services have not been live tested in-browser.

## Real-world property import (optional online tools)
- Open Find / import property. Enter a complete US street address or latitude and longitude, then choose a site width and depth (10–2,000 ft). Census address matches may be interpolated; verify location visually.
- Load aerial preview requests public USGS NAIP imagery in Web Mercator, with local latitude scale correction. Clicking the preview recenters the request; reload to see the new area. Import as new site embeds the image locally with approximate ground scale, rather than requiring manual calibration. It replaces the current project only after confirmation when a design exists; Undo restores it.
- Find Texas parcel at center queries the statewide TxGIO layer. If one simple parcel is found, the site is resized around it with a 10-ft buffer. Reload imagery, inspect the yellow outline, and import if appropriate. Multiple, multipart, oversized or unavailable parcels require manual tracing. Boundaries are appraisal GIS data, not surveys.
- Create scaled site without image is a fallback if imagery is unavailable. The raw aerial link and existing manual image importer provide another fallback. Manual calibration, replacement imagery and canvas resizing clear the geographic reference to prevent inconsistent coordinates.
- Estimate USGS slope samples four edge midpoint elevations using EPQS; review the calculated east/south percent slopes before applying a planar grade. This is not a full DEM, surveyed elevation model or hydrology simulation.
- Address lookup uses Census's documented JSONP mechanism in a sandboxed iframe. Aerial, parcel and elevation requests require internet and provider availability; no API key or paid subscription is required by these selected public endpoints. External services may be temporarily unavailable or reject browser requests. The local editor remains usable independently.
- Addresses are submitted to Census; coordinates to USGS and Texas GIS as requested. Geographic center, imagery and boundary can be stored in local autosave and project JSON; do not publish client project files. Imagery attribution is displayed in the design view.
- Sources: [Census Geocoder](https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.html), [USGS NAIP](https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer), [Texas parcel service](https://feature.geographic.texas.gov/arcgis/rest/services/Parcels/stratmap_land_parcels_48_most_recent/MapServer), [USGS EPQS](https://epqs.nationalmap.gov/v1/docs).
- Coordinate transformations, mock import, boundary conversion, grade calculations and undo/redo were tested locally in a simulated interface. Live service responses/browser compatibility have not yet been verified.

## Terrain and water features
- In the left Terrain & water panel, set east and south site slopes independently (−20% to +20%). Positive values rise in the indicated direction. Elevations are relative to the flat property's center datum, not surveyed elevations.
- Choose a berm or depression, set width, length and height/depth, and click its center in 2D. Landforms use smooth elliptical profiles; overlapping effects add together. Up to 40 landforms per project. Select them through the terrain list or on the plan, then edit dimensions or delete/duplicate.
- Draw pond, rain garden or dry creek outlines using the polygon tool. Rain gardens can be mass planted; ponds and dry creeks are excluded from target beds and avoided when obstacle avoidance is enabled. Water-feature outlines are separate from ordinary material quantities and do not automatically excavate terrain, hold level water or calculate runoff.
- The 2D plan displays schematic landform rings and relative cursor elevations. 3D uses a shaded conceptual terrain mesh; plants follow the local grade and rigid structures sit at their center elevation. For relief projects, canvas editing is in 2D only; 3D is for camera inspection. Imported aerial images are hidden in 3D relief view.
- Load terrain example demonstrates the new tools. Reset slopes & landforms leaves other design objects and water outlines intact. Terrain fields save in the existing project JSON, with older flat projects remaining compatible.
- These are visual concept tools, not survey, engineering, drainage, cut/fill or construction calculations. Surface areas remain horizontal plan areas; no volume, slope stability or water storage estimates are implied.

## Plant palette organization
- All 315 existing records are grouped into eight collapsible growth-form categories by default; categories and plants within each category are alphabetical. Switch between common and scientific name sorting, or disable grouping for a single A–Z list.
- Search and growth-form filtering automatically expand matching groups; Expand all and Collapse all provide manual control. The mass planting species selectors use the same categories and selected sort order. Plant quantities and CSV export are alphabetical by common name.
- Existing classifications, plant IDs, and project data are unchanged; the categories are the current library's design growth forms, not a new botanical audit.

## Regional plant library
- The 315 records are a local snapshot of the existing [Target Zone Plant List](https://crking92.github.io/Target-Zone-Plant-List/), sourced from [plants_public_v3.js](https://github.com/Crking92/Target-Zone-Plant-List/blob/main/data/processed/plants_public_v3.js), source blob SHA `40c60770f070511d61b15fc7ba03977acdb2104d`. The upstream repository is unchanged.
- Search common names (including aliases), scientific names or family; filter by growth form. All 315 are available for individual and mass placement. Existing ten species retain their original IDs, and saved project dimensions are unchanged.
- Default dimensions use midpoints of numeric ranges in the source. Twenty-two records have at least one missing or non-numeric dimension; those use editable, explicitly marked growth-form placeholders for that dimension. Vine length is not interpreted as vertical height. Source values remain visible when a plant is selected.
- The library carries source habit, light, water, bloom months and bloom colors, with source profile links where available. Rendering uses generic procedural forms and a simplified color palette, not species-accurate illustrations.
- This is the user's existing regional list, not a fresh BONAP county audit or verification of current nursery stock. No non-list taxa or cultivars have been added. Later reconciliation should retain exact taxon and source provenance, and distinguish regional listing from actual stock.

## Mass planting
- Draw a bed, then select it and click Mass plant this bed, or select a target from the Mass planting panel. The bed selector works even when plants cover the surface.
- Set center-to-center spacing (0.5–100 ft), optional edge buffer, and square, staggered/triangular, or naturalized (jittered staggered) pattern.
- Add distinct species and assign percentages totaling 100. Actual integer quantities use largest-remainder allocation. Shuffle changes the deterministic randomized assignment and naturalized positions; the preview reports actual counts.
- Optionally avoid existing plant centers and house/path/hardscape footprints, and vary plant dimensions by ±15%. Edge buffers constrain plant centers rather than canopy edges. Jittered spacing is approximate, and no ecological compatibility or mature canopy collision calculation is implied.
- Preview does not change the project. Place plants commits the entire batch as a single undo operation, with each plant remaining separately editable and counted in CSV exports. Later edits to the bed do not automatically move or regenerate plants.
- Up to 2,000 plants per batch and fewer than 20,000 objects per project; large candidate grids are rejected. Increase spacing or split large areas. Performance depends on device and project size. Keep JSON backups.
 
## 3D camera controls
- Enter 3D concept to enable camera orbit mode automatically. Left-drag horizontally to rotate a full 360 degrees and vertically to tilt from 15 to 85 degrees above ground.
- Click Edit objects to leave orbit mode, or select a drawing tool. Right-drag orbits in either mode. Space + drag or middle mouse pans; wheel zooms.
- Rotation and viewing-angle sliders, Low/High presets and arrow keys provide alternate controls. Reset view restores the initial camera.
- Camera changes do not modify project geometry or undo history. Plant graphics remain stylized screen-facing symbols in an orthographic scene, not full 3D meshes.

## Hardscape library
- Select a limestone boulder, bench, picnic table, raised planter, birdbath, stepping stone, garden shed or pergola from the right-hand palette and click the property to place it.
- Select Wood fence or Limestone wall, then click two endpoints to draw a straight segment at any angle. Repeat for additional segments. Select / move allows editing length (width), thickness (depth), height, center coordinates and rotation.
- All hardscape objects have original stylized 2D and orthographic 3D graphics and editable concept dimensions. Duplicate and delete work like other objects.
- Surface quantities includes hardscape counts and linear footage. Export hardscape CSV exports counts and lengths, not material takeoffs or construction specifications.
- Use Draw path / patio or Draw bed / surface with the desired material for patios and driveways. Continuous curved paths and connected fence joins are not yet implemented.

## Aerial reference
1. Set approximate drawing canvas dimensions, then Import property image (PNG, JPEG or WebP; maximum source file size 30 MB).
2. In 2D, click two recognizable points on the image and enter their actual distance in feet. Snapping is disabled during calibration. The image scales uniformly around the first point; existing plants, property dimensions and other objects do not move. Calibrate before drawing.
3. Adjust image opacity, toggle Show image, or remove the reference. Images are downscaled to at most 1600 pixels on the longest side and compressed as JPEG; the original is not uploaded or stored on a server.
4. This is a visual reference, not a survey or automatic geographic georeferencing tool. Use only images you have permission to use.

## Saving and exports
Save project JSON for durable backups; Open JSON restores it. The file includes the imported reference image and the lot outline. Version 1 projects remain readable; new optional fields are added to the existing schema. Browser local storage is best-effort and may be cleared or reach quota. Export PNG of the active view and CSV of plant quantities. Keep customer images, addresses and projects local; never commit them to the public source repository.

## Scope and limits
Conceptual terrain, rectangular buildings and paths, rounded polygon surfaces, approximate 3D drawing order. Plant sizes use the regional source snapshot or flagged concept placeholders; not independently verified county nativity or planting specifications. No GIS services, automatic parcel import, ecological analysis, or construction documentation yet. Not a CAD/survey tool. The MIT license covers the original program; imported images remain subject to their own rights.

## Next phase
Test drawing and aerial calibration in the live browser. Next improve proposal and 3D presentation (v0.9.5), then performance and release QA. v0.9.3 insect dataset integration remains on hold; retain the existing regional plant library as the foundation and verify outstanding dimensions and county-level nativity separately. Verify regional native species using BONAP and botanical references in the dedicated plant library phase. Keep dependencies free and assets original or license-compatible.
