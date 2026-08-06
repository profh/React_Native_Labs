/**
 * Collision detection utilities
 * Provides AABB (Axis-Aligned Bounding Box) collision detection
 */

/**
 * Check if two bounding boxes intersect
 */
export const checkCollision = (bounds1, bounds2) => {
  return (
    bounds1.left < bounds2.right &&
    bounds1.right > bounds2.left &&
    bounds1.top < bounds2.bottom &&
    bounds1.bottom > bounds2.top
  );
};

/**
 * Find all collisions between entities in two arrays
 */
export const detectCollisions = (entities1, entities2) => {
  const collisions = [];

  for (const entity1 of entities1) {
    for (const entity2 of entities2) {
      if (checkCollision(entity1.getBounds(), entity2.getBounds())) {
        collisions.push({ entity1, entity2 });
      }
    }
  }

  return collisions;
};

/**
 * Check collision between a single entity and an array of entities
 */
export const detectEntityCollisions = (entity, entities) => {
  const entityBounds = entity.getBounds();

  for (const other of entities) {
    if (checkCollision(entityBounds, other.getBounds())) {
      return other;
    }
  }

  return null;
};