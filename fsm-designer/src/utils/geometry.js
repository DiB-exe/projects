// Graphical geometry and trigonometry for Canvas rendering

export const NODE_RADIUS = 25;

export const drawArrowhead = (ctx, x, y, angle, length = 12, width = 8) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-length, width / 2);
  ctx.lineTo(-length, -width / 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

export const getPointOnCircle = (cx, cy, radius, angle) => ({
  x: cx + radius * Math.cos(angle),
  y: cy + radius * Math.sin(angle)
});

// Calculate where a line intersects a node's visual boundary
export const getEdgeConnectionPoints = (nodeA, nodeB, offsetAngle = 0) => {
  const dx = nodeB.x - nodeA.x;
  const dy = nodeB.y - nodeA.y;
  let angle = Math.atan2(dy, dx);
  
  // Offset angle for curved multi-edges
  angle += offsetAngle;

  const start = getPointOnCircle(nodeA.x, nodeA.y, NODE_RADIUS, angle);
  const end = getPointOnCircle(nodeB.x, nodeB.y, NODE_RADIUS, angle + Math.PI);
  
  return { start, end, angle };
};
