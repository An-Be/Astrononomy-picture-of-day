export const particles = {
    canvas: {
      canvasFillSpace: true,
      width: 200,
      height: 200,
      useBouncyWalls: false,
    },
    particle: {
      particleCount: 200,
      color: "#ffff",
      minSize: 1,
      maxSize: 2,
    },
    velocity: {
      directionAngle: 180,
      directionAngleVariance: 60,
      minSpeed: 1,
      maxSpeed: null,
    },
    opacity: {
      minOpacity: 0.5,
      maxOpacity: 1,
      opacityTransitionTime: 10000,
    },
  };