/* Rotate Tile and all its "contents" (walls and tokens).
Rotation will be clockwise if degrees is positive.
If Elevation Ruler, ATV, ATC, Light Mask or Walled Templates available,
optionally rotate only objects within alpha bounds.

Tokens are rotated if their center is within the bounds.
Walls rotated if their starting endpoint ("a") is within the bounds.
This allows you to have two overlapping walls, one outside and one inside, to help with wall drift.

*/

let TILE_UUID;
let ROTATION_DEGREES
CONFIG.rotateTileContentsCache ??= new WeakMap();

// ----- User inputs ---- //
TILE_UUID = "Scene.TgltqrGUnL9llqt2.Tile.3C9Iz63jaz4IAwo1";
ROTATION_DEGREES = 90; // Amount to rotate the tile contents
const USE_ALPHA_BOUNDS = true; // Remove the tile's outer transparent border.
const ALPHA_THRESHOLD = 0.75; // Percent alpha for a tile pixel to count as not transparent.


TILE_UUID ??= canvas.tiles.controlled[0]?.document?.uuid;
if ( !TILE_UUID ) return ui.notifications.error("Rotate tile script requires a controlled tile or a tile UUID.");

// ---- Get Tile to rotate ----- //
const tileDoc = foundry.utils.fromUuidSync(TILE_UUID);
const tile = tileDoc?.object;
if ( !tile ) return ui.notifications.error("Rotate tile script did not find a valid tile.");

// ----- Dialog ----- //

const content =
`
  <div class="form-group">
    <label>Rotation (Degrees) </label>
      <div class="form-fields">
        <input name="rotation" type="number" min="0" max="360" step="1" value="90" autofocus>
      </div>
  </div>
`;

let dialogResult;
  try {
    dialogResult = await foundry.applications.api.DialogV2.prompt({
      window: { title: `Rotate tile ${TILE_UUID}` },
      content,
      buttons: [
      {
        action: "ok",
        label: "Rotate!",
        callback: (event, button, dialog) => {
          return {
            rotation: button.form.elements.rotation.valueAsNumber,
          };
        },
      },
      {
        action: "clear",
        label: "Clear Cache",
      }],
    });
  } catch {
    dialogResult = null;
  }
if ( !dialogResult ) return;
if ( dialogResult === "clear" ) {
  CONFIG.rotateTileContentsCache.delete(tile);
  ui.notifications.notify("Cleared wall cache for Rotate tile script.");
  return;
}
ROTATION_DEGREES = dialogResult.rotation;


// ----- Wall cache ----- //
// Cache the wall positions to limit drift due to integer wall coordinates.
const tileWallCache = CONFIG.rotateTileContentsCache.get(tile) ?? {
  rotationToDate: 0,
  wallCache: new WeakMap(),
};
CONFIG.rotateTileContentsCache.set(tile, tileWallCache);


/* Test tile onlyrotation
tileDoc = foundry.utils.fromUuidSync(TILE_UUID);
await tileDoc.update({ rotation: tileDoc.rotation + ROTATION_DEGREES })
*/

/**
 * Calculate a local bounding polygon based on a specific threshold.
 * @param {number} [threshold=0.75]   Values lower than this will be ignored around the edges.
 * @returns {PIXI.Polygon} Polygon based on local coordinates.
 */
function alphaBorderLocalPolygon(tile, threshold = 0.75) {
  const pixelCache = tile.evPixelCache;
  if ( !pixelCache ) return tile.bounds.toPolygon();

  threshold = threshold * pixelCache.maximumPixelValue;

  // Build each row in local space.
  // Move from top to bottom on left side.
  // Then move bottom to top on right side.
  // Brute force.
  const { left, right, top, bottom } = pixelCache;

  const poly = new PIXI.Polygon();
  for ( let y = top; y <= bottom; y += 1 ) {
    // Scan each row from right to left.
    for ( let x = right; x >= left; x -=  1 ) {
      const a = pixelCache._pixelAtLocal(x, y);
      if ( a > threshold ) {
        poly.points.push(x, y);
        break;
      }
    }
  }

  for ( let y = bottom; y >= top; y -= 1 ) {
    // Scan each row from left to right.
    for ( let x = left; x <= right; x +=  1 ) {
      const a = pixelCache._pixelAtLocal(x, y);
      if ( a > threshold ) {
        poly.addPoint({x, y}); // Use addPoint to avoid repeats.
        break;
      }
    }
  }

  return poly;
}

/**
 * Calculate a bounding polygon based on a specific threshold.
 * @param {number} [threshold=0.75]   Values lower than this will be ignored around the edges.
 * @returns {PIXI.Polygon} Polygon based on local coordinates.
 */
function alphaBorderPolygon(tile, threshold = 0.75) {
  const pixelCache = tile.evPixelCache;
  if ( !pixelCache ) return tile.bounds.toPolygon();
  const localPoly = alphaBorderLocalPolygon(tile, threshold);
  return new PIXI.Polygon([...localPoly.iteratePoints({ close: false })].map(pt => pixelCache._toCanvasCoordinates(pt.x, pt.y, pt)))
}

function translatePoint(a, dx, dy, outPoint) {
  outPoint ??= a.clone();
  outPoint.x = a.x + dx;
  outPoint.y = a.y + dy;
  return outPoint;
}

function rotatePoint(a, radians, outPoint) {
  outPoint ??= a.clone();
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const { x, y } = a; // Avoid accidentally using the outPoint values when calculating new y.
  outPoint.x = (x * cos) - (y * sin);
  outPoint.y = (x * sin) + (y * cos);
  return outPoint;
}

/**
 * Rotate point around another point .
 * @param {PIXI.Point} pt         Point to rotate
 * @param {PIXI.Point} center     Point to rotate around
 * @param {number} radians        Rotation in radians
 */
function rotatePointAroundCenter(pt, center, radians, outPoint) {
  outPoint ??= new PIXI.Point();

  // Translate so center is at origin.
  // pt.translate(-center.x, -center.y, outPoint)
  translatePoint(pt, -center.x, -center.y, outPoint);

  // Rotate.
  // outPoint.rotate(radians, outPoint);
  rotatePoint(outPoint, radians, outPoint);

  // Translate back.
  // return outPoint.translate(center.x, center.y, outPoint);
  return translatePoint(outPoint, center.x, center.y, outPoint);
}

/**
 * Rotate token around another point.
 * @param {Token} token           Token to rotate
 * @param {PIXI.Point} center     Point to rotate around
 * @param {number} rotation       Rotation in radians
 * @returns {Promise}
 */
async function rotateTokenAroundCenter(token, center, rotation) {
  // Tokens use top left corner as anchor for movement.
  const TL = new PIXI.Point(token.x, token.y)

  // Could use token.getSnappedPosition(newTL) here but would drift when rotating repeatedly.
  // See Token.document.resize for example.
  const newTL = rotatePointAroundCenter(TL, center, rotation);
  const waypoint = {
    x: newTL.x,
    y: newTL.y,
    action: "displace",
  }

  return token.document.move(waypoint);
}

/**
 * Rotate light around another point.
 * @param {AmbientLight} light    Light to rotate
 * @param {PIXI.Point} center     Point to rotate around
 * @param {number} rotation       Rotation in radians
 * @returns {Promise}
 */
async function rotateLightAroundCenter(light, center, rotation) {
  const pt = new PIXI.Point(light.x, light.y)
  const newPt = rotatePointAroundCenter(pt, center, rotation);
  return light.document.update({ x: newPt.x, y: newPt.y });
}

/*
function testRotation(pt, center, rotation) {
  const newCenter = rotatePointAroundCenter(pt, center, rotation);
  Draw.point(newCenter)
  return newCenter;
}
*/

/**
 * Rotate wall around another point.
 * @param {Wall} wall             Wall to rotate
 * @param {PIXI.Point} center     Point to rotate around
 * @param {number} rotation       Rotation in radians
 * @returns {Promise}
 */
async function rotateWallAroundCenter(wall, center, rotation, rotationDegrees) {
  const newA = new PIXI.Point();
  const newB = new PIXI.Point();

  // To limit drifting, cache the rotation for a given wall.
  // Thus, the same rotation state will result in the same wall coordinates.
  const cachedMap = tileWallCache.wallCache.get(wall);
  const newDegrees = Math.normalizeDegrees(Math.round(tileWallCache.rotationToDate + rotationDegrees));
  if ( cachedMap.has(newDegrees) ) {
    const res = cachedMap.get(newDegrees);
    newA.x = res.a.x;
    newA.y = res.a.y;
    newB.x = res.b.x;
    newB.y = res.b.y;
  } else {
    rotatePointAroundCenter(wall.edge.a, center, rotation, newA);
    rotatePointAroundCenter(wall.edge.b, center, rotation, newB);
  }

  const out = await wall.document.update({ c: [newA.x, newA.y, newB.x, newB.y] });
  // console.debug(`${wall.id}\n\t${wall.document.c.join()} -->\n\t${[newA.x, newA.y, newB.x, newB.y].join()}\n\t${wall.document.c.join()}`);
}

/**
 * Store current position of a wall, tied to the current rotation for this script.
 */
function cacheWall(wall) {
  const cachedMap = tileWallCache.wallCache.get(wall);
  const map = cachedMap ?? new Map();
  map.set(tileWallCache.rotationToDate, { a: wall.edge.a.clone(), b: wall.edge.b.clone() });
  tileWallCache.wallCache.set(wall, map);
}


/*
function rotateWallTest(wall, center, rotation) {
  const newA = rotatePointAroundCenter(wall.edge.a, center, rotation);
  const newB = rotatePointAroundCenter(wall.edge.b, center, rotation);
  return [newA.x, newA.y, newB.x, newB.y];
}
*/

/**
 * Rotate template around another point.
 * @param {MeasuredTemplate} template   Template to rotate
 * @param {PIXI.Point} center           Point to rotate around
 * @param {number} rotation             Rotation in radians
 * @returns {Promise}
 */
async function rotateTemplateAroundCenter(template, center, rotation) {
  const newCenter = rotatePointAroundCenter(template.center, center, rotation);
  return template.document.update({ x: Math.round(newCenter.x), y: Math.round(newCenter.y) });
}

/**
 * Rotate region around another point.
 * Rotates every shape within the region.
 * @param {Region} region               Region to rotate
 * @param {PIXI.Point} center           Point to rotate around
 * @param {number} rotation             Rotation in radians
 * @returns {Promise}
 */
async function rotateRegionAroundCenter(region, center, rotation, rotationDegrees) {
  rotationDegrees ??= Math.toDegrees(rotation);
  const shapes = [];
  for ( const shape of region.document.shapes ) {
    const s = shape.toJSON();
    switch ( shape.type ) {
      case "rectangle": {
        const rectCenter = new PIXI.Point(shape.x + (shape.width * 0.5), shape.y + (shape.height * 0.5));
        const newCenter = rotatePointAroundCenter(rectCenter, center, rotation);
        const newTL = new PIXI.Point(newCenter.x - (shape.width * 0.5), newCenter.y - (shape.height * 0.5))
        s.x = newTL.x;
        s.y = newTL.y;
        s.rotation += rotationDegrees;
        break;
      }
      case "circle": {
        const newCenter = rotatePointAroundCenter(new PIXI.Point(shape.x, shape.y), center, rotation);
        s.x = newCenter.x;
        s.y = newCenter.y;
        // Rotation for circle is not relevant.
        break;
      }
      case "ellipse": {
        const newCenter = rotatePointAroundCenter(new PIXI.Point(shape.x, shape.y), center, rotation);
        s.x = newCenter.x;
        s.y = newCenter.y;
        s.rotation += rotationDegrees;
        break;
      }
      case "polygon": {
        const ln = s.points.length;
        const points = Array(ln)
        for ( let i = 0; i < ln; i += 2 ) {
          const newPt = rotatePointAroundCenter(new PIXI.Point(s.points[i], s.points[i+1]), center, rotation);
          points[i] = newPt.x;
          points[i+1] = newPt.y;
        }
        s.points = points;
        break;
      }
    }
    shapes.push(s);
  }
  return region.document.update({ shapes });
}

// ---- Filter placeables  ---- //
const bounds = tile.bounds;
const alphaBounds = alphaBorderPolygon(tile);
const tokens = canvas.tokens.placeables.filter(token => {
  const tCenter = token.center;
  if ( !bounds.contains(tCenter.x, tCenter.y) ) return false;
  if ( !USE_ALPHA_BOUNDS ) return true;
  return alphaBounds.contains(tCenter.x, tCenter.y);
});
const walls = canvas.walls.placeables.filter(wall => {
  const a = wall.edge.a;
  if ( !(bounds.contains(a.x, a.y)) ) return false;
  if ( !USE_ALPHA_BOUNDS ) return true;
  return alphaBounds.contains(a.x, a.y);
});
const templates = canvas.templates.placeables.filter(template => {
  const tCenter = template.center;
  if ( !bounds.contains(tCenter.x, tCenter.y) ) return false;
  if ( !USE_ALPHA_BOUNDS ) return true;
  return alphaBounds.contains(tCenter.x, tCenter.y);
});
const regions = canvas.regions.placeables.filter(region => {
  const rCenter = region.center;
  if ( !bounds.contains(rCenter.x, rCenter.y) ) return false;
  if ( !USE_ALPHA_BOUNDS ) return true;
  return alphaBounds.contains(rCenter.x, rCenter.y);
});

const lights = canvas.lighting.placeables.filter(light => {
  const lCenter = light.center;
  if ( !bounds.contains(lCenter.x, lCenter.y) ) return false;
  if ( !USE_ALPHA_BOUNDS ) return true;
  return alphaBounds.contains(lCenter.x, lCenter.y);
});

// ----- Update wall cache ----- //
walls.forEach(wall => cacheWall(wall));

// ----- Calculate Rotation  ----- //
/* Tricky part: Each placeable rotates relative to the *tile* center.
Tokens have to use move displace to jump to a new spot.
Regions must handle each shape separately.
*/
const rotation = Math.toRadians(ROTATION_DEGREES);
const tileCenter = USE_ALPHA_BOUNDS ? alphaBounds.center : bounds.center;
const promises = [];
promises.push(tileDoc.update({ rotation: tileDoc.rotation + ROTATION_DEGREES }));
tokens.forEach(token => promises.push(rotateTokenAroundCenter(token, tileCenter, rotation)))
walls.forEach(wall => promises.push(rotateWallAroundCenter(wall, tileCenter, rotation, ROTATION_DEGREES)));
templates.forEach(template => promises.push(rotateTemplateAroundCenter(template, tileCenter, rotation)))
regions.forEach(region => promises.push(rotateRegionAroundCenter(region, tileCenter, rotation, ROTATION_DEGREES)))
lights.forEach(light => promises.push(rotateLightAroundCenter(light, tileCenter, rotation, ROTATION_DEGREES)))
await Promise.allSettled(promises);

// Update the rotation state for this tile cache.
tileWallCache.rotationToDate += ROTATION_DEGREES;
tileWallCache.rotationToDate = Math.normalizeDegrees(Math.round(tileWallCache.rotationToDate));
