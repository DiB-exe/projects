import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const PALETTE = [
  'INPUT',
  'OUTPUT',
  'CLOCK',
  'AND',
  'OR',
  'NOT',
  'NAND',
  'NOR',
  'XOR',
  'XNOR',
  'SR',
  'D',
  'JK',
  'T',
]

function gateIO(kind) {
  if (kind === 'INPUT') {
    return { inputs: [], outputs: ['OUT'] }
  }
  if (kind === 'OUTPUT') {
    return { inputs: ['IN'], outputs: [] }
  }
  if (kind === 'CLOCK') {
    return { inputs: [], outputs: ['CLK'] }
  }
  if (kind === 'NOT') {
    return { inputs: ['A'], outputs: ['Y'] }
  }
  if (kind === 'SR') {
    return { inputs: ['S', 'R', 'CLK'], outputs: ['Q', 'NQ'] }
  }
  if (kind === 'D') {
    return { inputs: ['D', 'CLK'], outputs: ['Q', 'NQ'] }
  }
  if (kind === 'JK') {
    return { inputs: ['J', 'K', 'CLK'], outputs: ['Q', 'NQ'] }
  }
  if (kind === 'T') {
    return { inputs: ['T', 'CLK'], outputs: ['Q', 'NQ'] }
  }
  return { inputs: ['A', 'B'], outputs: ['Y'] }
}

function makeNode(kind, id, x, y) {
  const io = gateIO(kind)
  const outputValues = Object.fromEntries(io.outputs.map((pin) => [pin, false]))
  const inputValues = Object.fromEntries(io.inputs.map((pin) => [pin, false]))
  const base = {
    id,
    kind,
    x,
    y,
    inputPins: io.inputs,
    outputPins: io.outputs,
    inputValues,
    outputValues,
    state: {},
  }

  if (kind === 'INPUT') {
    base.state = { value: false }
    base.outputValues.OUT = false
  }

  if (kind === 'OUTPUT') {
    base.state = { value: false }
  }

  if (kind === 'CLOCK') {
    base.outputValues.CLK = false
  }

  if (kind === 'SR' || kind === 'D' || kind === 'JK' || kind === 'T') {
    base.state = { q: false, prevClk: false }
    base.outputValues.Q = false
    base.outputValues.NQ = true
  }

  return base
}

function nodeSize(node) {
  const pinCount = Math.max(node.inputPins.length, node.outputPins.length, 1)
  return { width: 142, height: 56 + pinCount * 24 }
}

function pinPosition(node, pin, output) {
  const { width } = nodeSize(node)
  const pins = output ? node.outputPins : node.inputPins
  const idx = Math.max(0, pins.findIndex((p) => p === pin))
  return {
    x: output ? node.x + width : node.x,
    y: node.y + 52 + idx * 24,
  }
}

function evaluateCircuit(currentNodes, edges, clockLevel) {
  const nodes = currentNodes.map((node) => ({
    ...node,
    state: { ...node.state },
    inputValues: { ...node.inputValues },
    outputValues: { ...node.outputValues },
  }))

  const byId = Object.fromEntries(nodes.map((node) => [node.id, node]))

  for (const node of nodes) {
    for (const pin of node.inputPins) {
      node.inputValues[pin] = false
    }
    for (const pin of node.outputPins) {
      node.outputValues[pin] = false
    }

    if (node.kind === 'INPUT') {
      node.outputValues.OUT = Boolean(node.state.value)
    }
    if (node.kind === 'CLOCK') {
      node.outputValues.CLK = Boolean(clockLevel)
    }
    if (node.kind === 'SR' || node.kind === 'D' || node.kind === 'JK' || node.kind === 'T') {
      const q = Boolean(node.state.q)
      node.outputValues.Q = q
      node.outputValues.NQ = !q
    }
  }

  const readInput = (targetId, pin) => {
    const edge = edges.find((item) => item.toNode === targetId && item.toPin === pin)
    if (!edge) return false
    const src = byId[edge.fromNode]
    return Boolean(src?.outputValues?.[edge.fromPin])
  }

  for (let step = 0; step < 10; step += 1) {
    let changed = false

    for (const node of nodes) {
      const inputs = {}
      for (const pin of node.inputPins) {
        inputs[pin] = readInput(node.id, pin)
      }
      node.inputValues = inputs

      if (node.kind === 'INPUT' || node.kind === 'CLOCK') {
        continue
      }

      if (node.kind === 'OUTPUT') {
        const val = Boolean(inputs.IN)
        if (node.state.value !== val) changed = true
        node.state.value = val
        continue
      }

      if (node.kind === 'AND' || node.kind === 'OR' || node.kind === 'NAND' || node.kind === 'NOR' || node.kind === 'XOR' || node.kind === 'XNOR' || node.kind === 'NOT') {
        const a = Boolean(inputs.A)
        const b = Boolean(inputs.B)
        let y = false
        if (node.kind === 'AND') y = a && b
        if (node.kind === 'OR') y = a || b
        if (node.kind === 'NAND') y = !(a && b)
        if (node.kind === 'NOR') y = !(a || b)
        if (node.kind === 'XOR') y = a !== b
        if (node.kind === 'XNOR') y = a === b
        if (node.kind === 'NOT') y = !a

        if (node.outputValues.Y !== y) changed = true
        node.outputValues.Y = y
        continue
      }

      const clk = Boolean(inputs.CLK)
      const rising = !node.state.prevClk && clk
      if (rising) {
        const q = Boolean(node.state.q)
        let qNext = q

        if (node.kind === 'SR') {
          const s = Boolean(inputs.S)
          const r = Boolean(inputs.R)
          if (s && !r) qNext = true
          if (!s && r) qNext = false
        }

        if (node.kind === 'D') {
          qNext = Boolean(inputs.D)
        }

        if (node.kind === 'JK') {
          const j = Boolean(inputs.J)
          const k = Boolean(inputs.K)
          if (j && !k) qNext = true
          if (!j && k) qNext = false
          if (j && k) qNext = !q
        }

        if (node.kind === 'T') {
          if (inputs.T) qNext = !q
        }

        if (qNext !== q) changed = true
        node.state.q = qNext
      }

      node.state.prevClk = clk
      const q = Boolean(node.state.q)
      if (node.outputValues.Q !== q || node.outputValues.NQ !== !q) changed = true
      node.outputValues.Q = q
      node.outputValues.NQ = !q
    }

    if (!changed) break
  }

  return nodes
}

function hitNode(nodes, x, y) {
  for (let idx = nodes.length - 1; idx >= 0; idx -= 1) {
    const node = nodes[idx]
    const { width, height } = nodeSize(node)
    if (x >= node.x && x <= node.x + width && y >= node.y && y <= node.y + height) {
      return node
    }
  }
  return null
}

function hitPin(nodes, x, y, output) {
  for (let idx = nodes.length - 1; idx >= 0; idx -= 1) {
    const node = nodes[idx]
    const pins = output ? node.outputPins : node.inputPins
    for (const pin of pins) {
      const p = pinPosition(node, pin, output)
      const dx = x - p.x
      const dy = y - p.y
      if (dx * dx + dy * dy <= 64) {
        return { nodeId: node.id, pin }
      }
    }
  }
  return null
}

function truthTableFor(nodes, edges) {
  const inputNodes = nodes.filter((node) => node.kind === 'INPUT')
  const outputNodes = nodes.filter((node) => node.kind === 'OUTPUT')

  if (inputNodes.length === 0 || outputNodes.length === 0) {
    return { headers: [], rows: [], note: 'Add INPUT and OUTPUT nodes to generate a truth table.' }
  }

  if (inputNodes.length > 8) {
    return { headers: [], rows: [], note: 'Truth table is capped at 8 inputs (256 rows).' }
  }

  const headers = [
    ...inputNodes.map((node) => node.id),
    ...outputNodes.map((node) => node.id),
  ]

  const rows = []
  const combos = 2 ** inputNodes.length

  for (let n = 0; n < combos; n += 1) {
    const working = nodes.map((node) => ({
      ...node,
      state: { ...node.state },
      inputValues: { ...node.inputValues },
      outputValues: { ...node.outputValues },
    }))

    for (let i = 0; i < inputNodes.length; i += 1) {
      const bit = (n >> (inputNodes.length - i - 1)) & 1
      const target = working.find((node) => node.id === inputNodes[i].id)
      if (target) target.state.value = Boolean(bit)
    }

    for (const node of working) {
      if (node.kind === 'SR' || node.kind === 'D' || node.kind === 'JK' || node.kind === 'T') {
        node.state.q = false
        node.state.prevClk = false
      }
    }

    const solved = evaluateCircuit(working, edges, false)

    const row = {}
    for (const node of inputNodes) {
      const matched = solved.find((item) => item.id === node.id)
      row[node.id] = matched?.state?.value ? 1 : 0
    }
    for (const node of outputNodes) {
      const matched = solved.find((item) => item.id === node.id)
      row[node.id] = matched?.state?.value ? 1 : 0
    }

    rows.push(row)
  }

  return { headers, rows, note: '' }
}

function App() {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const idRef = useRef(1)

  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 760 })
  const [nodes, setNodes] = useState(() => {
    const n1 = makeNode('INPUT', 'N1', 120, 120)
    const n2 = makeNode('OUTPUT', 'N2', 620, 180)
    idRef.current = 3
    return [n1, n2]
  })
  const [edges, setEdges] = useState([])
  const [dragNode, setDragNode] = useState(null)
  const [pendingOutput, setPendingOutput] = useState(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [clockHz, setClockHz] = useState(1)
  const [clockRun, setClockRun] = useState(false)
  const [clockLevel, setClockLevel] = useState(false)
  const [table, setTable] = useState({ headers: [], rows: [], note: '' })

  const evalAndSet = useCallback((nextNodes, nextEdges, nextClock) => {
    const solved = evaluateCircuit(nextNodes, nextEdges, nextClock)
    setNodes(solved)
  }, [])

  useEffect(() => {
    const update = () => {
      const host = wrapRef.current
      if (!host) return
      const rect = host.getBoundingClientRect()
      const width = Math.max(780, Math.floor(rect.width - 24))
      setCanvasSize({ width, height: 760 })
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    if (!clockRun) return undefined
    const interval = window.setInterval(() => {
      setClockLevel((prev) => !prev)
    }, Math.max(40, Math.floor(500 / Math.max(0.2, clockHz))))

    return () => window.clearInterval(interval)
  }, [clockRun, clockHz])

  useEffect(() => {
    evalAndSet(nodes, edges, clockLevel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clockLevel])

  const getPoint = useCallback((evt) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    }
  }, [])

  const addNode = useCallback((kind, x, y) => {
    const id = `N${idRef.current}`
    idRef.current += 1
    const created = makeNode(kind, id, x, y)
    const nextNodes = [...nodes, created]
    evalAndSet(nextNodes, edges, clockLevel)
  }, [clockLevel, edges, evalAndSet, nodes])

  const onDropPalette = useCallback((evt) => {
    evt.preventDefault()
    const kind = evt.dataTransfer.getData('text/plain')
    if (!PALETTE.includes(kind)) return
    const p = getPoint(evt)
    addNode(kind, p.x - 70, p.y - 40)
  }, [addNode, getPoint])

  const onDragOver = useCallback((evt) => {
    evt.preventDefault()
  }, [])

  const onMouseDown = useCallback((evt) => {
    const p = getPoint(evt)
    setMouse(p)

    if (pendingOutput) {
      const inputHit = hitPin(nodes, p.x, p.y, false)
      if (inputHit) {
        const nextEdge = {
          id: `E${Date.now()}${Math.random().toString(16).slice(2)}`,
          fromNode: pendingOutput.nodeId,
          fromPin: pendingOutput.pin,
          toNode: inputHit.nodeId,
          toPin: inputHit.pin,
        }

        const withoutSameInput = edges.filter(
          (edge) => !(edge.toNode === nextEdge.toNode && edge.toPin === nextEdge.toPin),
        )
        const nextEdges = [...withoutSameInput, nextEdge]
        setEdges(nextEdges)
        setPendingOutput(null)
        evalAndSet(nodes, nextEdges, clockLevel)
        return
      }
      setPendingOutput(null)
    }

    const outputHit = hitPin(nodes, p.x, p.y, true)
    if (outputHit) {
      setPendingOutput(outputHit)
      return
    }

    const node = hitNode(nodes, p.x, p.y)
    if (node) {
      setDragNode({ id: node.id, dx: p.x - node.x, dy: p.y - node.y })
    }
  }, [clockLevel, edges, evalAndSet, getPoint, nodes, pendingOutput])

  const onMouseMove = useCallback((evt) => {
    const p = getPoint(evt)
    setMouse(p)

    if (!dragNode) return
    setNodes((prev) => prev.map((node) => (
      node.id === dragNode.id
        ? { ...node, x: p.x - dragNode.dx, y: p.y - dragNode.dy }
        : node
    )))
  }, [dragNode, getPoint])

  const onMouseUp = useCallback(() => {
    if (dragNode) {
      evalAndSet(nodes, edges, clockLevel)
    }
    setDragNode(null)
  }, [clockLevel, dragNode, edges, evalAndSet, nodes])

  const toggleInput = useCallback((id) => {
    const nextNodes = nodes.map((node) => {
      if (node.id !== id || node.kind !== 'INPUT') return node
      return {
        ...node,
        state: { ...node.state, value: !node.state.value },
      }
    })
    evalAndSet(nextNodes, edges, clockLevel)
  }, [clockLevel, edges, evalAndSet, nodes])

  const pulseClock = useCallback(() => {
    setClockLevel((prev) => !prev)
  }, [])

  const clearAll = useCallback(() => {
    idRef.current = 1
    setEdges([])
    const n1 = makeNode('INPUT', 'N1', 120, 120)
    const n2 = makeNode('OUTPUT', 'N2', 620, 180)
    idRef.current = 3
    evalAndSet([n1, n2], [], false)
    setClockLevel(false)
    setClockRun(false)
    setTable({ headers: [], rows: [], note: '' })
  }, [evalAndSet])

  const saveJson = useCallback(() => {
    const payload = {
      clockHz,
      nodes,
      edges,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'circuit.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [clockHz, edges, nodes])

  const loadJson = useCallback((evt) => {
    const file = evt.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) return

        const maxId = parsed.nodes
          .map((node) => Number(String(node.id).replace('N', '')))
          .filter((n) => Number.isFinite(n))
          .reduce((acc, val) => Math.max(acc, val), 0)

        idRef.current = maxId + 1
        setEdges(parsed.edges)
        setClockHz(Number(parsed.clockHz) || 1)
        setClockLevel(false)
        evalAndSet(parsed.nodes, parsed.edges, false)
        setTable({ headers: [], rows: [], note: '' })
      } catch {
        // Intentionally ignore malformed files.
      }
    }

    reader.readAsText(file)
    evt.target.value = ''
  }, [evalAndSet])

  const buildTruthTable = useCallback(() => {
    const generated = truthTableFor(nodes, edges)
    setTable(generated)
  }, [edges, nodes])

  const inputNodes = useMemo(
    () => nodes.filter((node) => node.kind === 'INPUT'),
    [nodes],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = canvasSize.width
    canvas.height = canvasSize.height

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#090f14'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = 'rgba(142, 169, 196, 0.15)'
    ctx.lineWidth = 1
    for (let x = 20; x < canvas.width; x += 24) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 20; y < canvas.height; y += 24) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    for (const edge of edges) {
      const from = nodes.find((node) => node.id === edge.fromNode)
      const to = nodes.find((node) => node.id === edge.toNode)
      if (!from || !to) continue
      const p1 = pinPosition(from, edge.fromPin, true)
      const p2 = pinPosition(to, edge.toPin, false)
      const signal = Boolean(from.outputValues?.[edge.fromPin])

      ctx.strokeStyle = signal ? '#42e2b8' : '#8aa0b8'
      ctx.lineWidth = signal ? 3 : 2
      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      const c1x = p1.x + 70
      const c2x = p2.x - 70
      ctx.bezierCurveTo(c1x, p1.y, c2x, p2.y, p2.x, p2.y)
      ctx.stroke()
    }

    if (pendingOutput) {
      const from = nodes.find((node) => node.id === pendingOutput.nodeId)
      if (from) {
        const p1 = pinPosition(from, pendingOutput.pin, true)
        ctx.strokeStyle = '#fcbf49'
        ctx.lineWidth = 2
        ctx.setLineDash([6, 6])
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(mouse.x, mouse.y)
        ctx.stroke()
        ctx.setLineDash([])
      }
    }

    for (const node of nodes) {
      const { width, height } = nodeSize(node)

      ctx.fillStyle = '#13202b'
      ctx.strokeStyle = '#2c3f50'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(node.x, node.y, width, height, 12)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#f4f9ff'
      ctx.font = '700 14px "Space Grotesk", sans-serif'
      ctx.fillText(`${node.kind} • ${node.id}`, node.x + 12, node.y + 24)

      for (const pin of node.inputPins) {
        const p = pinPosition(node, pin, false)
        const on = Boolean(node.inputValues?.[pin])
        ctx.fillStyle = on ? '#42e2b8' : '#5f738a'
        ctx.beginPath()
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#d2e5f8'
        ctx.font = '12px "IBM Plex Mono", monospace'
        ctx.fillText(pin, node.x + 12, p.y + 4)
      }

      for (const pin of node.outputPins) {
        const p = pinPosition(node, pin, true)
        const on = Boolean(node.outputValues?.[pin])
        ctx.fillStyle = on ? '#42e2b8' : '#5f738a'
        ctx.beginPath()
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
        ctx.fill()

        const txt = `${pin}`
        const txtW = ctx.measureText(txt).width
        ctx.fillStyle = '#d2e5f8'
        ctx.font = '12px "IBM Plex Mono", monospace'
        ctx.fillText(txt, node.x + width - txtW - 12, p.y + 4)
      }

      if (node.kind === 'INPUT') {
        ctx.fillStyle = node.state.value ? '#42e2b8' : '#3a4a59'
        ctx.beginPath()
        ctx.roundRect(node.x + 12, node.y + height - 30, width - 24, 18, 8)
        ctx.fill()
      }

      if (node.kind === 'OUTPUT') {
        ctx.fillStyle = node.state.value ? '#42e2b8' : '#3a4a59'
        ctx.beginPath()
        ctx.arc(node.x + width / 2, node.y + height - 20, 8, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }, [canvasSize, edges, mouse, nodes, pendingOutput])

  return (
    <div className="app">
      <aside className="panel">
        <h1>Logic Gate Lab</h1>
        <p className="subtitle">React + Canvas simulator with combinational and sequential logic.</p>

        <div className="section">
          <h2>Palette</h2>
          <div className="chips">
            {PALETTE.map((kind) => (
              <button
                key={kind}
                className="chip"
                draggable
                onDragStart={(evt) => evt.dataTransfer.setData('text/plain', kind)}
              >
                {kind}
              </button>
            ))}
          </div>
          <p className="hint">Drag a chip onto the canvas. Click output pin then input pin to wire.</p>
        </div>

        <div className="section">
          <h2>Clock</h2>
          <div className="clock-row">
            <label htmlFor="hz">Hz: {clockHz.toFixed(1)}</label>
            <input
              id="hz"
              type="range"
              min="0.2"
              max="8"
              step="0.1"
              value={clockHz}
              onChange={(evt) => setClockHz(Number(evt.target.value))}
            />
          </div>
          <div className="actions">
            <button onClick={() => setClockRun((v) => !v)}>{clockRun ? 'Stop Clock' : 'Run Clock'}</button>
            <button onClick={pulseClock}>Step Clock</button>
          </div>
          <p className="hint">Level: {clockLevel ? 'HIGH' : 'LOW'}</p>
        </div>

        <div className="section">
          <h2>Inputs</h2>
          <div className="inputs-list">
            {inputNodes.map((node) => (
              <button key={node.id} onClick={() => toggleInput(node.id)}>
                {node.id}: {node.state.value ? '1' : '0'}
              </button>
            ))}
            {inputNodes.length === 0 && <span className="hint">Add INPUT nodes</span>}
          </div>
        </div>

        <div className="section">
          <h2>Circuit</h2>
          <div className="actions">
            <button onClick={buildTruthTable}>Truth Table</button>
            <button onClick={saveJson}>Save JSON</button>
            <label className="load-btn">
              Load JSON
              <input type="file" accept="application/json" onChange={loadJson} />
            </label>
            <button onClick={clearAll}>Reset</button>
          </div>
        </div>
      </aside>

      <main className="workspace" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          onDrop={onDropPalette}
          onDragOver={onDragOver}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        />

        <section className="table-wrap">
          <h2>Truth Table</h2>
          {table.note && <p className="hint">{table.note}</p>}
          {table.rows.length > 0 && (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    {table.headers.map((head) => (
                      <th key={head}>{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, idx) => (
                    <tr key={`r-${idx}`}>
                      {table.headers.map((head) => (
                        <td key={`${idx}-${head}`}>{row[head]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
