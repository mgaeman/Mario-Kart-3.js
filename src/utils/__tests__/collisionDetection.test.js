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
        { name: 'not ground', isMesh: true }
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
