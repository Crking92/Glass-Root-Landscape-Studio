# Glass Root Landscape Studio v0.2

Free, independent, stylized landscape concept editor. [Open the web app](https://crking92.github.io/Glass-Root-Landscape-Studio/). No installation, external libraries, network API requests, accounts, or paid assets are required. All plant symbols are original procedural drawings. The 3D concept view is an orthographic projection, not a photorealistic mesh renderer.

## Getting started
- Click Example to explore a sample design, or New to start blank.
- Use 2D plan for drawing. Place plants, draw buildings and rectangular paths using two opposite corners, and measure with two clicks.
- Select Draw bed / surface, choose a material, click corners, then Finish shape or Enter. Enable Smooth new bed corners to round the outline; selected beds can also be smoothed afterward. The calculated area follows the rounded outline.
- Draw lot boundary creates a custom visual lot outline and reports its area. Reset lot boundary removes it. The width/depth fields control the rectangular drawing canvas. The boundary does not clip or prohibit object placement.
- Set snapping to off, 6 inches, 1 foot, or 5 feet. Use Select / move to drag, edit, duplicate, or delete objects.
- Choose mulch, gravel, concrete, decomposed granite, grass, or bare soil for new surfaces or edit the material of a selected surface. Surface quantities are summed individually; overlaps are not deducted. Mulch volume = area (sq ft) × depth (in) / 324, before waste allowance.
- Space + drag or middle mouse pans; wheel zooms. Switch to 3D concept and rotate the view.

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
Test drawing and aerial calibration in the live browser. Then improve shape editing, curved paths, dimensions, and introduce material/object libraries and mass planting tools. Verify regional native species using BONAP and botanical references in the dedicated plant library phase. Keep dependencies free and assets original or license-compatible.
