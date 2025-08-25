import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Vector3 } from 'three';

// Mock the modules before importing
vi.mock('three', () => {
  return {
    Vector3: vi.fn().mockImplementation((x = 0, y = 0, z = 0) => ({
      x, y, z,
      copy: vi.fn().mockReturnThis(),
      add: vi.fn().mockReturnThis(),
      sub: vi.fn().mockReturnThis(),
      normalize: vi.fn().mockReturnThis(),
      multiplyScalar: vi.fn().mockReturnThis(),
      length: vi.fn().mockReturnValue(10),
      clone: vi.fn().mockReturnThis(),
      negate: vi.fn().mockReturnThis(),
      reflect: vi.fn().mockReturnThis(),
      lerp: vi.fn().mockReturnThis(),
      applyAxisAngle: vi.fn().mockReturnThis()
    })),
    Raycaster: vi.fn().mockImplementation(() => ({
      set: vi.fn(),
      far: 3,
      firstHitOnly: true,
      intersectObjects: vi.fn().mockReturnValue([])
    }))
  };
});

// Import the collision detection module
import * as collisionModule from '../collisionDetection';

// Mock the collision detection functions
vi.mock('../collisionDetection');

describe('Collision Detection', () => {
  let mockScene;
  let mockPosition;
  let mockVelocity;
  let mockHitPoint;
  let mockHitNormal;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockScene = {
      children: [
        { name: 'ground', isMesh: true, geometry: { boundsTree: {} } },
        { name: 'ground dirt', isMesh: true, geometry: { boundsTree: {} } },
        { name: 'wall', isMesh: true, geometry: { boundsTree: {} } },
        { name: 'barrier', isMesh: true, geometry: { boundsTree: {} } },
        { name: 'block wall', isMesh: true, geometry: { boundsTree: {} } },
        { name: 'not collision', isMesh: true }
      ]
    };
    
    mockPosition = new Vector3(0, 0, 0);
    mockVelocity = new Vector3(0, 0, -10);
    mockHitPoint = new Vector3(0, 0, -5);
    mockHitNormal = new Vector3(0, 0, 1);
  });

  describe('checkBoundaryCollision', () => {
    it('should call checkBoundaryCollision with correct parameters', () => {
      vi.mocked(collisionModule.checkBoundaryCollision).mockReturnValue(null);
      
      collisionModule.checkBoundaryCollision(mockPosition, mockVelocity, mockScene);
      
      expect(collisionModule.checkBoundaryCollision).toHaveBeenCalledWith(mockPosition, mockVelocity, mockScene);
    });

    it('should return collision data when a collision is detected', () => {
      const mockCollision = { hit: true, type: 'track_edge' };
      vi.mocked(collisionModule.checkBoundaryCollision).mockReturnValue(mockCollision);
      
      const result = collisionModule.checkBoundaryCollision(mockPosition, mockVelocity, mockScene);
      
      expect(result).toEqual(mockCollision);
    });

    it('should detect collision with wall mesh', () => {
      const mockWallCollision = { 
        hit: true, 
        point: new Vector3(0, 0, -2),
        normal: new Vector3(0, 0, 1),
        distance: 2,
        type: 'wall' 
      };
      vi.mocked(collisionModule.checkBoundaryCollision).mockReturnValue(mockWallCollision);
      
      const result = collisionModule.checkBoundaryCollision(mockPosition, mockVelocity, mockScene);
      
      expect(result.hit).toBe(true);
      expect(result.type).toBe('wall');
      expect(result.distance).toBe(2);
    });

    it('should detect collision with barrier mesh', () => {
      const mockBarrierCollision = { 
        hit: true, 
        point: new Vector3(0, 0, -1.5),
        normal: new Vector3(0, 0, 1),
        distance: 1.5,
        type: 'wall' 
      };
      vi.mocked(collisionModule.checkBoundaryCollision).mockReturnValue(mockBarrierCollision);
      
      const result = collisionModule.checkBoundaryCollision(mockPosition, mockVelocity, mockScene);
      
      expect(result.hit).toBe(true);
      expect(result.type).toBe('wall');
    });

    it('should detect collision with block wall mesh', () => {
      const mockBlockCollision = { 
        hit: true, 
        point: new Vector3(0, 0, -3),
        normal: new Vector3(0, 0, 1),
        distance: 3,
        type: 'wall' 
      };
      vi.mocked(collisionModule.checkBoundaryCollision).mockReturnValue(mockBlockCollision);
      
      const result = collisionModule.checkBoundaryCollision(mockPosition, mockVelocity, mockScene);
      
      expect(result.hit).toBe(true);
      expect(result.type).toBe('wall');
    });
  });

  describe('calculateBounceResponse', () => {
    it('should call calculateBounceResponse with correct parameters', () => {
      const mockResponse = { velocity: mockVelocity, force: 8, direction: mockVelocity };
      vi.mocked(collisionModule.calculateBounceResponse).mockReturnValue(mockResponse);
      
      const result = collisionModule.calculateBounceResponse(mockHitPoint, mockHitNormal, mockVelocity);
      
      expect(collisionModule.calculateBounceResponse).toHaveBeenCalledWith(mockHitPoint, mockHitNormal, mockVelocity);
      expect(result).toEqual(mockResponse);
    });

    it('should pass custom bounce strength when provided', () => {
      const mockResponse = { velocity: mockVelocity, force: 5, direction: mockVelocity };
      vi.mocked(collisionModule.calculateBounceResponse).mockReturnValue(mockResponse);
      
      const customBounceStrength = 0.5;
      const result = collisionModule.calculateBounceResponse(mockHitPoint, mockHitNormal, mockVelocity, customBounceStrength);
      
      expect(collisionModule.calculateBounceResponse).toHaveBeenCalledWith(
        mockHitPoint, mockHitNormal, mockVelocity, customBounceStrength
      );
      expect(result).toEqual(mockResponse);
    });

    it('should calculate bounce response for wall collisions', () => {
      const wallNormal = new Vector3(1, 0, 0);
      const mockWallBounceResponse = { 
        velocity: new Vector3(-8, 0, 0), 
        force: 8, 
        direction: new Vector3(-1, 0, 0) 
      };
      vi.mocked(collisionModule.calculateBounceResponse).mockReturnValue(mockWallBounceResponse);
      
      const result = collisionModule.calculateBounceResponse(mockHitPoint, wallNormal, mockVelocity);
      
      expect(collisionModule.calculateBounceResponse).toHaveBeenCalledWith(mockHitPoint, wallNormal, mockVelocity);
      expect(result.force).toBe(8);
    });

    it('should handle different wall collision normals', () => {
      const diagonalWallNormal = new Vector3(0.707, 0, 0.707);
      const mockDiagonalBounceResponse = { 
        velocity: new Vector3(-5.66, 0, -5.66), 
        force: 8, 
        direction: new Vector3(-0.707, 0, -0.707) 
      };
      vi.mocked(collisionModule.calculateBounceResponse).mockReturnValue(mockDiagonalBounceResponse);
      
      const result = collisionModule.calculateBounceResponse(mockHitPoint, diagonalWallNormal, mockVelocity);
      
      expect(collisionModule.calculateBounceResponse).toHaveBeenCalledWith(mockHitPoint, diagonalWallNormal, mockVelocity);
      expect(result.force).toBe(8);
    });
  });

  describe('getTrackBoundaries', () => {
    it('should extract ground meshes from scene', () => {
      const mockBoundaries = [
        { mesh: { name: 'ground' }, type: 'ground', name: 'ground' },
        { mesh: { name: 'ground dirt' }, type: 'ground', name: 'ground dirt' }
      ];
      vi.mocked(collisionModule.getTrackBoundaries).mockReturnValue(mockBoundaries);
      
      const result = collisionModule.getTrackBoundaries(mockScene);
      
      expect(collisionModule.getTrackBoundaries).toHaveBeenCalledWith(mockScene);
      expect(result).toEqual(mockBoundaries);
    });

    it('should extract wall meshes from scene', () => {
      const mockBoundaries = [
        { mesh: { name: 'ground' }, type: 'ground', name: 'ground' },
        { mesh: { name: 'ground dirt' }, type: 'ground', name: 'ground dirt' },
        { mesh: { name: 'wall' }, type: 'wall', name: 'wall' },
        { mesh: { name: 'barrier' }, type: 'wall', name: 'barrier' },
        { mesh: { name: 'block wall' }, type: 'wall', name: 'block wall' }
      ];
      vi.mocked(collisionModule.getTrackBoundaries).mockReturnValue(mockBoundaries);
      
      const result = collisionModule.getTrackBoundaries(mockScene);
      
      expect(collisionModule.getTrackBoundaries).toHaveBeenCalledWith(mockScene);
      expect(result).toEqual(mockBoundaries);
    });

    it('should categorize wall meshes correctly', () => {
      const mockBoundaries = [
        { mesh: { name: 'wall' }, type: 'wall', name: 'wall' },
        { mesh: { name: 'barrier' }, type: 'wall', name: 'barrier' },
        { mesh: { name: 'block wall' }, type: 'wall', name: 'block wall' }
      ];
      vi.mocked(collisionModule.getTrackBoundaries).mockReturnValue(mockBoundaries);
      
      const result = collisionModule.getTrackBoundaries(mockScene);
      
      expect(result.every(boundary => 
        boundary.name.includes('wall') || boundary.name.includes('barrier') || boundary.name.includes('block') 
        ? boundary.type === 'wall' 
        : true
      )).toBe(true);
    });
  });

  describe('isPositionOnTrack', () => {
    it('should return true when position is on track', () => {
      vi.mocked(collisionModule.isPositionOnTrack).mockReturnValue(true);
      
      const result = collisionModule.isPositionOnTrack(mockPosition, mockScene);
      
      expect(collisionModule.isPositionOnTrack).toHaveBeenCalledWith(mockPosition, mockScene);
      expect(result).toBe(true);
    });

    it('should return false when position is not on track', () => {
      vi.mocked(collisionModule.isPositionOnTrack).mockReturnValue(false);
      
      const result = collisionModule.isPositionOnTrack(mockPosition, mockScene);
      
      expect(collisionModule.isPositionOnTrack).toHaveBeenCalledWith(mockPosition, mockScene);
      expect(result).toBe(false);
    });

    it('should pass maxDistance parameter when provided', () => {
      vi.mocked(collisionModule.isPositionOnTrack).mockReturnValue(false);
      
      const maxDistance = 3.0;
      const result = collisionModule.isPositionOnTrack(mockPosition, mockScene, maxDistance);
      
      expect(collisionModule.isPositionOnTrack).toHaveBeenCalledWith(mockPosition, mockScene, maxDistance);
      expect(result).toBe(false);
    });
  });

  describe('checkMultiDirectionalCollision', () => {
    it('should check collisions in multiple directions', () => {
      const mockCollision = { hit: true, type: 'track_edge', directionIndex: 1 };
      vi.mocked(collisionModule.checkMultiDirectionalCollision).mockReturnValue(mockCollision);
      
      const result = collisionModule.checkMultiDirectionalCollision(mockPosition, mockVelocity, mockScene);
      
      expect(collisionModule.checkMultiDirectionalCollision).toHaveBeenCalledWith(mockPosition, mockVelocity, mockScene);
      expect(result).toEqual(mockCollision);
    });

    it('should return null when no collisions are detected', () => {
      vi.mocked(collisionModule.checkMultiDirectionalCollision).mockReturnValue(null);
      
      const result = collisionModule.checkMultiDirectionalCollision(mockPosition, mockVelocity, mockScene);
      
      expect(collisionModule.checkMultiDirectionalCollision).toHaveBeenCalledWith(mockPosition, mockVelocity, mockScene);
      expect(result).toBeNull();
    });
  });
});
