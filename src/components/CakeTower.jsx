import { useEffect, useRef, useState } from 'react'

const CANVAS_WIDTH = 360
const CANVAS_HEIGHT = 540
const LAYER_HEIGHT = 28
const INITIAL_WIDTH = 180
const BASE_Y = 440
const MAX_TOWERS = 20 // <--- Límite de alta dificultad (20 pisos)

const CAKE_FLAVORS = [
  { body: '#FF8FA3', shadow: '#E06D82', frosting: '#FFF0F3' }, // Fresa
  { body: '#D4A373', shadow: '#B08256', frosting: '#FEFAE0' }, // Vainilla
  { body: '#8D5B4C', shadow: '#6B4236', frosting: '#F3D5B5' }, // Chocolate
  { body: '#90DBF4', shadow: '#6BB8D1', frosting: '#FFFFFF' }, // Mora azul
  { body: '#B9FBC0', shadow: '#8FD697', frosting: '#F7FFF7' }, // Menta
  { body: '#FDE4CF', shadow: '#DFC1A7', frosting: '#FFCFD2' }, // Durazno
]

const REGALOS_DISPONIBLES = [
  'Mousse de Chocolate',
  'Tiramisú Clásico',
  'Tarta de Santiago'
]

function CakeTower({ onSelectReward }) {
  const canvasRef = useRef(null)
  const [ui, setUi] = useState({
    status: 'START', // 'START' | 'PLAYING' | 'GAMEOVER' | 'WIN'
    combo: 0,
  })

  const [regaloSeleccionado, setRegaloSeleccionado] = useState(null)

  const gameRef = useRef({
    status: 'START',
    combo: 0,
    stack: [],
    current: null,
    fallingPieces: [],
    floatingTexts: [],
    cameraY: 0,
    targetCameraY: 0,
    catBounce: 0,
    direction: 1,
  })

  const initGame = () => {
    const baseLayer = {
      x: (CANVAS_WIDTH - INITIAL_WIDTH) / 2,
      width: INITIAL_WIDTH,
      flavor: CAKE_FLAVORS[0],
    }

    gameRef.current = {
      status: 'PLAYING',
      combo: 0,
      stack: [baseLayer],
      current: {
        x: 0,
        width: INITIAL_WIDTH,
        speed: 3.2,
        flavor: CAKE_FLAVORS[1],
      },
      fallingPieces: [],
      floatingTexts: [],
      cameraY: 0,
      targetCameraY: 0,
      catBounce: 0,
      direction: 1,
    }

    setRegaloSeleccionado(null)
    setUi((prev) => ({
      ...prev,
      status: 'PLAYING',
      combo: 0,
    }))
  }

  const handleDrop = () => {
    const g = gameRef.current

    if (g.status === 'START' || g.status === 'GAMEOVER' || g.status === 'WIN') {
      initGame()
      return
    }

    if (g.status !== 'PLAYING' || !g.current) return

    const prevLayer = g.stack[g.stack.length - 1]
    const curr = g.current
    const delta = curr.x - prevLayer.x
    const absDelta = Math.abs(delta)
    const topScreenY = BASE_Y - g.stack.length * LAYER_HEIGHT

    // 1. Fallo completo: el piso cae fuera de la torre
    if (absDelta >= prevLayer.width) {
      g.fallingPieces.push({
        x: curr.x,
        y: topScreenY,
        width: curr.width,
        flavor: curr.flavor,
        vx: g.direction * 3,
        vy: 0,
        rotation: 0,
        vRot: g.direction * 0.06,
      })
      g.current = null
      g.status = 'GAMEOVER'

      setUi({
        status: 'GAMEOVER',
        combo: 0,
      })
      return
    }

    let newX = curr.x
    let newWidth = prevLayer.width - absDelta
    let isPerfect = false

    // 2. Aterrizaje perfecto (margen de 4px)
    if (absDelta <= 4) {
      isPerfect = true
      newX = prevLayer.x
      newWidth = prevLayer.width
      g.combo += 1

      if (g.combo >= 3 && newWidth < INITIAL_WIDTH) {
        const grow = Math.min(14, INITIAL_WIDTH - newWidth)
        newWidth += grow
        newX = Math.max(10, Math.min(CANVAS_WIDTH - newWidth - 10, newX - grow / 2))
      }

      g.floatingTexts.push({
        text: g.combo > 1 ? `¡PERFECTO x${g.combo}!` : '¡PERFECTO!',
        x: newX + newWidth / 2,
        y: topScreenY - 25,
        alpha: 1,
        color: '#FFD166',
      })
    } else {
      g.combo = 0
      if (delta > 0) {
        newX = curr.x
        g.fallingPieces.push({
          x: prevLayer.x + prevLayer.width,
          y: topScreenY,
          width: delta,
          flavor: curr.flavor,
          vx: 2.5,
          vy: -1,
          rotation: 0,
          vRot: 0.07,
        })
      } else {
        newX = prevLayer.x
        g.fallingPieces.push({
          x: curr.x,
          y: topScreenY,
          width: absDelta,
          flavor: curr.flavor,
          vx: -2.5,
          vy: -1,
          rotation: 0,
          vRot: -0.07,
        })
      }
    }

    // Agregar el piso apilado
    g.stack.push({
      x: newX,
      width: newWidth,
      flavor: curr.flavor,
    })

    g.catBounce = 12

    // Verificar si alcanzó el LÍMITE DE TORRES (Victoria a los 20 pisos)
    if (g.stack.length >= MAX_TOWERS) {
      g.current = null
      g.status = 'WIN'

      setUi({
        status: 'WIN',
        combo: g.combo,
      })
      return
    }

    // Subir cámara suavemente cuando la torre crece
    if (g.stack.length > 5) {
      g.targetCameraY = (g.stack.length - 5) * LAYER_HEIGHT
    }

    const nextFlavor = CAKE_FLAVORS[(g.stack.length + 1) % CAKE_FLAVORS.length]
    const nextDir = g.stack.length % 2 === 0 ? 1 : -1
    const nextSpeed = Math.min(8.5, 3.2 + g.stack.length * 0.22)

    g.direction = nextDir
    g.current = {
      x: nextDir === 1 ? 0 : CANVAS_WIDTH - newWidth,
      width: newWidth,
      speed: nextSpeed,
      flavor: nextFlavor,
    }

    setUi({
      status: 'PLAYING',
      combo: g.combo,
    })
  }

  // Soporte para barra espaciadora
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        handleDrop()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  // Bucle principal de renderizado a 60 FPS
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId

    const drawCakeSlice = (x, y, width, flavor) => {
      ctx.fillStyle = flavor.body
      ctx.beginPath()
      ctx.roundRect(x, y, width, LAYER_HEIGHT, 6)
      ctx.fill()

      ctx.fillStyle = flavor.shadow
      ctx.fillRect(x + 2, y + LAYER_HEIGHT - 5, Math.max(0, width - 4), 5)

      ctx.fillStyle = flavor.frosting
      ctx.beginPath()
      ctx.roundRect(x, y, width, 8, [6, 6, 2, 2])
      ctx.fill()

      const drips = Math.floor(width / 18)
      for (let i = 0; i < drips; i++) {
        const dripX = x + 9 + i * 18
        ctx.beginPath()
        ctx.arc(dripX, y + 8, 4.5, 0, Math.PI)
        ctx.fill()
      }
    }

    const drawCat = (centerX, bottomY) => {
      ctx.save()
      ctx.translate(centerX, bottomY)

      ctx.fillStyle = '#7D8597'
      ctx.beginPath()
      ctx.moveTo(-16, -24)
      ctx.lineTo(-20, -42)
      ctx.lineTo(-5, -30)
      ctx.closePath()
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(16, -24)
      ctx.lineTo(20, -42)
      ctx.lineTo(5, -30)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = '#FFAFCC'
      ctx.beginPath()
      ctx.moveTo(-14, -26)
      ctx.lineTo(-17, -37)
      ctx.lineTo(-8, -29)
      ctx.closePath()
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(14, -26)
      ctx.lineTo(17, -37)
      ctx.lineTo(8, -29)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = '#8D99AE'
      ctx.beginPath()
      ctx.arc(0, -16, 18, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#80ED99'
      ctx.beginPath()
      ctx.arc(-7, -18, 4.5, 0, Math.PI * 2)
      ctx.arc(7, -18, 4.5, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#1D1E2C'
      ctx.beginPath()
      ctx.arc(-7, -18, 2, 0, Math.PI * 2)
      ctx.arc(7, -18, 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#EDF2F4'
      ctx.beginPath()
      ctx.ellipse(0, -11, 7, 5, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#FF8FA3'
      ctx.beginPath()
      ctx.arc(0, -13, 2.5, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    const render = () => {
      const g = gameRef.current

      g.cameraY += (g.targetCameraY - g.cameraY) * 0.1
      if (g.catBounce > 0) g.catBounce *= 0.82

      const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
      grad.addColorStop(0, '#2B2D42')
      grad.addColorStop(1, '#8D99AE')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      ctx.save()
      ctx.translate(0, g.cameraY)

      ctx.fillStyle = '#E5E5E5'
      ctx.beginPath()
      ctx.roundRect(45, BASE_Y + LAYER_HEIGHT, CANVAS_WIDTH - 90, 14, 7)
      ctx.fill()

      g.stack.forEach((layer, idx) => {
        const y = BASE_Y - idx * LAYER_HEIGHT
        drawCakeSlice(layer.x, y, layer.width, layer.flavor)
      })

      if (g.stack.length > 0) {
        const top = g.stack[g.stack.length - 1]
        const topY = BASE_Y - (g.stack.length - 1) * LAYER_HEIGHT
        drawCat(top.x + top.width / 2, topY - g.catBounce)
      }

      if (g.status === 'PLAYING' && g.current) {
        g.current.x += g.current.speed * g.direction
        if (g.current.x + g.current.width >= CANVAS_WIDTH) {
          g.current.x = CANVAS_WIDTH - g.current.width
          g.direction = -1
        } else if (g.current.x <= 0) {
          g.current.x = 0
          g.direction = 1
        }

        const movingY = BASE_Y - g.stack.length * LAYER_HEIGHT
        drawCakeSlice(g.current.x, movingY, g.current.width, g.current.flavor)
      }

      g.fallingPieces = g.fallingPieces.filter((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.45
        p.rotation += p.vRot

        ctx.save()
        ctx.translate(p.x + p.width / 2, p.y + LAYER_HEIGHT / 2)
        ctx.rotate(p.rotation)
        drawCakeSlice(-p.width / 2, -LAYER_HEIGHT / 2, p.width, p.flavor)
        ctx.restore()

        return p.y - g.cameraY < CANVAS_HEIGHT + 100
      })

      g.floatingTexts = g.floatingTexts.filter((ft) => {
        ft.y -= 1.2
        ft.alpha -= 0.022
        ctx.save()
        ctx.globalAlpha = Math.max(0, ft.alpha)
        ctx.font = 'bold 18px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillStyle = '#2B2D42'
        ctx.fillText(ft.text, ft.x + 1, ft.y + 1)
        ctx.fillStyle = ft.color
        ctx.fillText(ft.text, ft.x, ft.y)
        ctx.restore()
        return ft.alpha > 0
      })

      ctx.restore()
      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#d48b44' }}>
        <span>🎯 Meta: {gameRef.current.stack.length} / {MAX_TOWERS} Pisos (Modo Desafío)</span>
      </div>

      <div style={{ position: 'relative', cursor: 'pointer', userSelect: 'none' }} onClick={handleDrop}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            display: 'block',
          }}
        />

        {ui.status !== 'PLAYING' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <h2 style={{ margin: '0 0 8px', fontSize: '1.6rem', color: ui.status === 'WIN' ? '#80ED99' : '#ffafcc' }}>
              {ui.status === 'START' && '🎂 Cake Tower: Hard Mode'}
              {ui.status === 'GAMEOVER' && '💥 ¡Torre derrumbada!'}
              {ui.status === 'WIN' && '🏆 ¡Victoria Épica!'}
            </h2>

            {ui.status === 'START' && (
              <p style={{ margin: '0 0 16px', fontSize: '0.9rem', maxWidth: '280px', opacity: 0.9 }}>
                Modo desafío activado. Apila <b>{MAX_TOWERS} pisos</b> con alta velocidad para desbloquear tu premio.
              </p>
            )}

            {ui.status === 'GAMEOVER' && (
              <p style={{ margin: '0 0 16px', fontSize: '0.9rem', opacity: 0.9 }}>
                ¡Cuidado con el ritmo! Inténtalo otra vez para conseguir el objetivo.
              </p>
            )}

            {ui.status === 'WIN' && (
              <div style={{ width: '100%' }}>
                {regaloSeleccionado ? (
                  <div style={{ backgroundColor: 'rgba(128, 237, 153, 0.25)', padding: '12px', borderRadius: '10px', margin: '10px 0' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', color: '#80ED99' }}>
                      🎁 ¡Premio Reclamado!
                    </p>
                    <p style={{ margin: '5px 0 0', fontSize: '0.85rem' }}>
                      Elegiste: <b>{regaloSeleccionado}</b>
                    </p>
                  </div>
                ) : (
                  <>
                    <p style={{ margin: '0 0 10px', fontSize: '0.85rem' }}>
                      ¡Superaste los {MAX_TOWERS} pisos! Selecciona tu opción de regalo:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', marginBottom: '12px' }}>
                      {REGALOS_DISPONIBLES.map((regalo) => (
                        <button
                          key={regalo}
                          onClick={(e) => {
                            e.stopPropagation()
                            setRegaloSeleccionado(regalo)
                            if (onSelectReward) {
                              onSelectReward(regalo) // <--- Agrega el regalo al carrito con precio $0
                            }
                          }}
                          style={{
                            padding: '7px 10px',
                            backgroundColor: '#fff',
                            color: '#333',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            transition: 'background 0.2s',
                          }}
                        >
                          🍰 {regalo}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {ui.status !== 'WIN' && (
              <button
                style={{
                  padding: '10px 22px',
                  fontSize: '0.95rem',
                  fontWeight: 'bold',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: '#FF8FA3',
                  color: '#fff',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(255, 143, 163, 0.4)'
                }}
              >
                {ui.status === 'START' ? 'Comenzar Desafío' : 'Reintentar'}
              </button>
            )}

            {ui.status === 'WIN' && regaloSeleccionado && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  initGame()
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  cursor: 'pointer',
                  marginTop: '5px',
                }}
              >
                Jugar de nuevo
              </button>
            )}

            {ui.status !== 'WIN' && (
              <small style={{ marginTop: '10px', opacity: 0.75, fontSize: '0.75rem' }}>
                Haz clic o presiona Espacio para soltar cada piso
              </small>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CakeTower