# Glass Root Landscape Studio v0.4

Free, independent, stylized landscape concept editor. [Open the web app](https://crking92.github.io/Glass-Root-Landscape-Studio/). No installation, external libraries, network API requests, accounts, or paid assets are required. All plant symbols are original procedural drawings. The 3D concept view is an orthographic projection, not a photorealistic mesh renderer.

## Getting started
- Click Example to explore a sample design, or New to start blank.
- Use 2D plan for drawing. Place plants, draw buildings and rectangular paths using two opposite corners, and measure with two clicks.
- Select Draw bed / surface, choose a material, click corners, then Finish shape or Enter. Enable Smooth new bed corners to round the outline; selected beds can also be smoothed afterward. The calculated area follows the rounded outline.
- Draw lot boundary creates a custom visual lot outline and reports its area. Reset lot boundary removes it. The width/depth fields control the rectangular drawing canvas. The boundary does not clip or prohibit object placement.
- Set snapping to off, 6 inches, 1 foot, or 5 feet. Use Select / move to drag, edit, duplicate, or delete objects.
- Choose mulch, gravel, concrete, decomposed granite, grass, or bare soil for new surfaces or edit the material of a selected surface. Surface quantities are summed individually; overlaps are not deducted. Mulch volume = area (sq ft) × depth (in) / 324, before waste allowance.
- Space + drag or middle mouse pans; wheel zooms. Switch to 3D concept and rotate the view.

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
Flat terrain, rectangular buildings and paths, rounded polygon surfaces, approximate 3D drawing order. Starter plant sizes are editable concept assumptions, not verified county nativity or planting specifications. No GIS services, automatic parcel import, ecological analysis, or construction documentation yet. Not a CAD/survey tool. The MIT license covers the original program; imported images remain subject to their own rights.

## Next phase
Test drawing and aerial calibration in the live browser. Next expand the regional native plant library with source-verified species, dimensions and nativity, then improve shape editing, curved paths and dimensions. Verify regional native species using BONAP and botanical references in the dedicated plant library phase. Keep dependencies free and assets original or license-compatible.
