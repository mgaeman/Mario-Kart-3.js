import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Vector3, Raycaster } from 'three';

vi.mock('three', () => ({
  Vector3: vi.fn().mockImplementation((x = 0, y = 0, z = 0) => ({
    x, y, z,
    set: vi.fn(),
    copy: vi.fn(),
    add: vi.fn(),
    sub: vi.fn(),
    normalize: vi.fn(),
    multiplyScalar: vi.fn(),
    clone: vi.fn().mockReturnThis(),
  })),
  Raycaster: vi.fn().mockImplementation(() => ({
    set: vi.fn(),
    far: 3,
    firstHitOnly: true,
    intersectObjects: vi.fn().mockReturnValue([]),
  })),
}));

describe('Kart Ground Detection', () => {
  let mockRaycaster;
  let mockWheelBase;
  let mockWheel;
  let mockScene;
  let getGroundPosition;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockRaycaster = {
      set: vi.fn(),
      far: 3,
      firstHitOnly: true,
      intersectObjects: vi.fn().mockReturnValue([]),
    };
    
    mockWheelBase = {
      current: {
        getWorldPosition: vi.fn((vector) => {
          vector.set(0, 5, 0);
        }),
      },
    };
    
    mockWheel = {
      current: {
        position: { y: 0 },
        isOnDirt: false,
      },
    };
    
    mockScene = {
      children: [],
    };

    getGroundPosition = (wheelBase, wheel, offset = 0, wheelIndex, delta) => {
      const origin = new Vector3();
      const direction = new Vector3(0, -1, 0);
      
      wheelBase.current.getWorldPosition(origin);
      mockRaycaster.set(origin, direction);
      mockRaycaster.far = 3;
      mockRaycaster.firstHitOnly = true;
      
      const intersects = mockRaycaster.intersectObjects(mockScene.children, true);
      
      if (intersects.length > 0) {
        const hit = intersects[0];
        const safeY = hit.point.y + 0.3;
        wheel.current.position.y = safeY;
        
        if (hit.object.name === "ground dirt" && hit.point.y < 0.5) {
          wheel.current.isOnDirt = true;
        } else {
          wheel.current.isOnDirt = false;
        }
        
        return safeY;
      } else {
        wheel.current.isOnDirt = false;
        return wheel.current.position.y;
      }
    };
  });

  it('should detect ground and set wheel position correctly', () => {
    const mockHit = {
      point: { y: 2.0 },
      object: { name: "ground" },
    };
    mockRaycaster.intersectObjects.mockReturnValue([mockHit]);

    const result = getGroundPosition(mockWheelBase, mockWheel, 0, 0, 0.016);

    expect(mockRaycaster.set).toHaveBeenCalled();
    expect(mockRaycaster.intersectObjects).toHaveBeenCalledWith(mockScene.children, true);
    expect(mockWheel.current.position.y).toBe(2.3); // hit.point.y + 0.3
    expect(mockWheel.current.isOnDirt).toBe(false);
    expect(result).toBe(2.3);
  });

  it('should detect dirt and set isOnDirt flag when hitting dirt surface', () => {
    const mockHit = {
      point: { y: 0.2 },
      object: { name: "ground dirt" },
    };
    mockRaycaster.intersectObjects.mockReturnValue([mockHit]);

    const result = getGroundPosition(mockWheelBase, mockWheel, 0, 0, 0.016);

    expect(mockWheel.current.position.y).toBe(0.5); // hit.point.y + 0.3
    expect(mockWheel.current.isOnDirt).toBe(true);
    expect(result).toBe(0.5);
  });

  it('should not set isOnDirt flag when dirt surface is too high', () => {
    const mockHit = {
      point: { y: 1.0 },
      object: { name: "ground dirt" },
    };
    mockRaycaster.intersectObjects.mockReturnValue([mockHit]);

    const result = getGroundPosition(mockWheelBase, mockWheel, 0, 0, 0.016);

    expect(mockWheel.current.position.y).toBe(1.3); // hit.point.y + 0.3
    expect(mockWheel.current.isOnDirt).toBe(false);
    expect(result).toBe(1.3);
  });

  it('should handle no intersection and maintain current wheel position', () => {
    mockRaycaster.intersectObjects.mockReturnValue([]);
    mockWheel.current.position.y = 5.0;

    const result = getGroundPosition(mockWheelBase, mockWheel, 0, 0, 0.016);

    expect(mockWheel.current.isOnDirt).toBe(false);
    expect(result).toBe(5.0); // maintains current position
  });

  it('should configure raycaster with correct parameters', () => {
    getGroundPosition(mockWheelBase, mockWheel, 0, 0, 0.016);

    expect(mockRaycaster.far).toBe(3);
    expect(mockRaycaster.firstHitOnly).toBe(true);
    expect(mockRaycaster.set).toHaveBeenCalled();
  });

  it('should call getWorldPosition on wheelBase', () => {
    getGroundPosition(mockWheelBase, mockWheel, 0, 0, 0.016);

    expect(mockWheelBase.current.getWorldPosition).toHaveBeenCalled();
  });
});
