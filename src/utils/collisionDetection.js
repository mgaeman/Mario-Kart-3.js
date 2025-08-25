import { Vector3, Raycaster } from 'three';

const raycaster = new Raycaster();
const direction = new Vector3();
const origin = new Vector3();

export function checkBoundaryCollision(position, velocity, scene, lookAheadDistance = 2.0) {
  const speed = velocity.length();
  if (speed < 0.1) return null;

  direction.copy(velocity).normalize();
  origin.copy(position);
  origin.y += 0.5;

  raycaster.set(origin, direction);
  raycaster.far = lookAheadDistance;
  raycaster.firstHitOnly = true;

  const intersects = raycaster.intersectObjects(scene.children, true);
  
  const groundIntersects = intersects.filter(hit => 
    hit.object.name && hit.object.name.includes('ground')
  );

  if (groundIntersects.length === 0) {
    const edgeCheckDistance = 1.5;
    const downDirection = new Vector3(0, -1, 0);
    const edgeCheckOrigin = new Vector3();
    
    edgeCheckOrigin.copy(position);
    edgeCheckOrigin.add(direction.clone().multiplyScalar(edgeCheckDistance));
    edgeCheckOrigin.y += 2.0;

    raycaster.set(edgeCheckOrigin, downDirection);
    raycaster.far = 5.0;
    
    const edgeIntersects = raycaster.intersectObjects(scene.children, true);
    const groundAhead = edgeIntersects.filter(hit => 
      hit.object.name && hit.object.name.includes('ground')
    );

    if (groundAhead.length === 0) {
      const hitPoint = new Vector3();
      hitPoint.copy(position).add(direction.clone().multiplyScalar(0.5));
      
      const hitNormal = direction.clone().negate();
      
      return {
        hit: true,
        point: hitPoint,
        normal: hitNormal,
        distance: 0.5,
        type: 'track_edge'
      };
    }
  }

  return null;
}

export function calculateBounceResponse(hitPoint, hitNormal, velocity, bounceStrength = 0.8) {
  const reflectedVelocity = new Vector3();
  
  reflectedVelocity.copy(velocity);
  reflectedVelocity.reflect(hitNormal);
  
  reflectedVelocity.multiplyScalar(bounceStrength);
  
  const minBounceSpeed = 2.0;
  if (reflectedVelocity.length() < minBounceSpeed) {
    reflectedVelocity.normalize().multiplyScalar(minBounceSpeed);
  }
  
  return {
    velocity: reflectedVelocity,
    force: reflectedVelocity.length(),
    direction: reflectedVelocity.clone().normalize()
  };
}

export function getTrackBoundaries(scene) {
  const boundaries = [];
  
  scene.children.forEach(child => {
    if (child.name && child.name.includes('ground')) {
      boundaries.push({
        mesh: child,
        type: 'ground',
        name: child.name
      });
    }
  });
  
  return boundaries;
}

export function isPositionOnTrack(position, scene, maxDistance = 3.0) {
  const downDirection = new Vector3(0, -1, 0);
  const checkOrigin = new Vector3();
  
  checkOrigin.copy(position);
  checkOrigin.y += 2.0;
  
  raycaster.set(checkOrigin, downDirection);
  raycaster.far = maxDistance + 2.0;
  raycaster.firstHitOnly = true;
  
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  const groundHits = intersects.filter(hit => 
    hit.object.name && hit.object.name.includes('ground')
  );
  
  if (groundHits.length > 0) {
    const hit = groundHits[0];
    const distanceToGround = Math.abs(position.y - hit.point.y);
    return distanceToGround <= maxDistance;
  }
  
  return false;
}

export function checkMultiDirectionalCollision(position, velocity, scene) {
  const collisions = [];
  const directions = [
    velocity.clone().normalize(),
    velocity.clone().normalize().applyAxisAngle(new Vector3(0, 1, 0), Math.PI / 4),
    velocity.clone().normalize().applyAxisAngle(new Vector3(0, 1, 0), -Math.PI / 4)
  ];
  
  directions.forEach((dir, index) => {
    const collision = checkBoundaryCollision(position, dir.multiplyScalar(velocity.length()), scene);
    if (collision) {
      collisions.push({
        ...collision,
        directionIndex: index
      });
    }
  });
  
  return collisions.length > 0 ? collisions[0] : null;
}
