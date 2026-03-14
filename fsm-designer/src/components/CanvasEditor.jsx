import React, { useRef, useEffect, useState } from 'react';
import { NODE_RADIUS, drawArrowhead, getEdgeConnectionPoints } from '../utils/geometry';

const CanvasEditor = ({ 
  fsm, 
  setFsm, 
  activeTool, // 'select', 'state', 'transition', 'delete'
  activeStateId, // For simulator highlighting
  playbackStep // If highlighting specific transition
}) => {
  const canvasRef = useRef(null);
  const [dragNodeId, setDragNodeId] = useState(null);
  const [drawingTransitionFrom, setDrawingTransitionFrom] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Transitions
    fsm.transitions.forEach(edge => {
      const nodeA = fsm.states.find(s => s.id === edge.from);
      const nodeB = fsm.states.find(s => s.id === edge.to);
      if (!nodeA || !nodeB) return;

      ctx.beginPath();
      ctx.strokeStyle = '#94a3b8'; // slate-400
      ctx.lineWidth = 2;

      let textX, textY;

      // Self loop
      if (nodeA.id === nodeB.id) {
        const loopRadius = 25;
        const cx = nodeA.x;
        const cy = nodeA.y - NODE_RADIUS - loopRadius + 5;
        
        ctx.arc(cx, cy, loopRadius, 0, 2 * Math.PI);
        ctx.stroke();

        // Arrowhead on loop
        drawArrowhead(ctx, nodeA.x + 10, nodeA.y - NODE_RADIUS - 2, Math.PI / 4, 10, 8);
        
        textX = cx;
        textY = cy - loopRadius - 10;
      } else {
        // Find if there's a reverse edge to curve them
        const hasReverse = fsm.transitions.some(t => t.from === edge.to && t.to === edge.from);
        
        const { start, end, angle } = getEdgeConnectionPoints(nodeA, nodeB, hasReverse ? 0.3 : 0);
        
        ctx.moveTo(start.x, start.y);
        
        if (hasReverse) {
          // Quadratic bezier curve
          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2;
          // Offset control point perpendicular to the line
          const cpOffset = 40;
          const cpx = midX - cpOffset * Math.sin(angle);
          const cpy = midY + cpOffset * Math.cos(angle);
          
          ctx.quadraticCurveTo(cpx, cpy, end.x, end.y);
          ctx.stroke();

          // Calculate angle at the end of the curve for arrowhead
          // Derivative of quadratic bezier at t=1
          const dirX = end.x - cpx;
          const dirY = end.y - cpy;
          const endAngle = Math.atan2(dirY, dirX);
          drawArrowhead(ctx, end.x, end.y, endAngle, 12, 10);
          
          textX = cpx; textY = cpy;
        } else {
          // Straight line
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
          drawArrowhead(ctx, end.x, end.y, angle, 12, 10);
          
          textX = (start.x + end.x) / 2;
          textY = (start.y + end.y) / 2 - 10;
        }
      }

      // Draw transition label
      ctx.fillStyle = '#f8fafc';
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Label background pill
      const metrics = ctx.measureText(edge.label);
      ctx.fillStyle = '#1e293b'; // slate-800
      ctx.fillRect(textX - metrics.width/2 - 4, textY - 10, metrics.width + 8, 20);
      
      ctx.fillStyle = playbackStep?.transitionId === edge.id ? '#fef08a' : '#93c5fd'; // yellow/blue
      ctx.fillText(edge.label, textX, textY);
    });

    // Draw partial transition if drawing
    if (drawingTransitionFrom) {
      const nodeA = fsm.states.find(s => s.id === drawingTransitionFrom);
      if (nodeA) {
        ctx.beginPath();
        ctx.strokeStyle = '#60a5fa'; // blue-400
        ctx.setLineDash([5, 5]);
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw States
    fsm.states.forEach(state => {
      const isActive = activeStateId === state.id;
      const isStart = fsm.startState === state.id;
      const isAccept = fsm.acceptStates.includes(state.id);
      
      // Base circle
      ctx.beginPath();
      ctx.arc(state.x, state.y, NODE_RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = isActive ? '#3b82f6' : '#1e293b'; // blue-500 / slate-800
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = isActive ? '#93c5fd' : '#cbd5e1'; // blue-300 / slate-300
      ctx.stroke();

      // Accept state double ring
      if (isAccept) {
        ctx.beginPath();
        ctx.arc(state.x, state.y, NODE_RADIUS - 5, 0, 2 * Math.PI);
        ctx.strokeStyle = isActive ? '#bfdbfe' : '#94a3b8';
        ctx.stroke();
      }

      // Start state arrow
      if (isStart) {
        ctx.beginPath();
        ctx.moveTo(state.x - NODE_RADIUS - 30, state.y);
        ctx.lineTo(state.x - NODE_RADIUS, state.y);
        ctx.strokeStyle = '#22c55e'; // green-500
        ctx.stroke();
        drawArrowhead(ctx, state.x - NODE_RADIUS, state.y, 0, 10, 8);
        ctx.fillStyle = ctx.strokeStyle;
      }

      // State Label
      ctx.fillStyle = '#f8fafc'; // slate-50
      ctx.font = 'bold 14px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(state.id, state.x, state.y);

      // Custom optional label below
      if (state.label && state.label !== state.id) {
        ctx.fillStyle = '#94a3b8'; // slate-400
        ctx.font = '12px "Inter", sans-serif';
        ctx.fillText(state.label, state.x, state.y + NODE_RADIUS + 15);
      }
    });

  }, [fsm, activeStateId, playbackStep, mousePos, drawingTransitionFrom]);

  // Event Handlers
  const getNodeAt = (x, y) => {
    // Reverse order so top-most is selected
    for (let i = fsm.states.length - 1; i >= 0; i--) {
      const state = fsm.states[i];
      const dx = x - state.x;
      const dy = y - state.y;
      if (dx*dx + dy*dy <= NODE_RADIUS*NODE_RADIUS) {
        return state;
      }
    }
    return null;
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNode = getNodeAt(x, y);

    if (activeTool === 'select') {
      if (clickedNode) setDragNodeId(clickedNode.id);
    } else if (activeTool === 'state') {
      if (!clickedNode) {
        // Create new state
        const newId = `s${fsm.states.length}`;
        setFsm(prev => ({
          ...prev,
          states: [...prev.states, { id: newId, label: newId, x, y }],
          // Auto set start state if first
          startState: prev.states.length === 0 ? newId : prev.startState
        }));
      }
    } else if (activeTool === 'transition') {
      if (clickedNode) {
        setDrawingTransitionFrom(clickedNode.id);
        setMousePos({ x, y });
      }
    } else if (activeTool === 'delete') {
      if (clickedNode) {
        setFsm(prev => ({
          ...prev,
          states: prev.states.filter(s => s.id !== clickedNode.id),
          transitions: prev.transitions.filter(t => t.from !== clickedNode.id && t.to !== clickedNode.id),
          startState: prev.startState === clickedNode.id ? null : prev.startState,
          acceptStates: prev.acceptStates.filter(id => id !== clickedNode.id)
        }));
      }
    } else if (activeTool === 'toggleAccept') {
      if (clickedNode) {
        setFsm(prev => {
          const isAccept = prev.acceptStates.includes(clickedNode.id);
          return {
            ...prev,
            acceptStates: isAccept 
              ? prev.acceptStates.filter(id => id !== clickedNode.id)
              : [...prev.acceptStates, clickedNode.id]
          };
        });
      }
    } else if (activeTool === 'setStart') {
      if (clickedNode) {
        setFsm(prev => ({ ...prev, startState: clickedNode.id }));
      }
    }
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (dragNodeId) {
      setFsm(prev => ({
        ...prev,
        states: prev.states.map(s => s.id === dragNodeId ? { ...s, x, y } : s)
      }));
    } else if (drawingTransitionFrom) {
      setMousePos({ x, y });
    }
  };

  const handleMouseUp = (e) => {
    if (drawingTransitionFrom) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const targetNode = getNodeAt(x, y);
      if (targetNode) {
        const symbol = prompt("Enter transition symbol(s) (comma separated):", "0");
        if (symbol) {
          const newTxId = `t${Date.now()}`;
          setFsm(prev => ({
            ...prev,
            transitions: [...prev.transitions, { 
              id: newTxId, 
              from: drawingTransitionFrom, 
              to: targetNode.id, 
              label: symbol.trim() 
            }]
          }));
        }
      }
      setDrawingTransitionFrom(null);
    }
    setDragNodeId(null);
  };

  return (
    <div className="w-full h-full bg-[#0f172a] rounded-xl border border-slate-700 overflow-hidden relative shadow-inner cursor-crosshair">
       <canvas
         ref={canvasRef}
         width={1000}
         height={800}
         className="w-full h-full block"
         onMouseDown={handleMouseDown}
         onMouseMove={handleMouseMove}
         onMouseUp={handleMouseUp}
         onMouseLeave={handleMouseUp}
       />
    </div>
  );
};

export default CanvasEditor;
