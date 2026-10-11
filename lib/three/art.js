// Box art, disc labels and the television's screens, painted on 2D canvases
// and handed to three.js as textures. Every game stars Leigh.

const PORTRAITS = {
  hero: '/me/hero-of-time.webp',
  agent: '/me/agent.webp',
  vault: '/me/vault-dweller.webp',
  commander: '/me/commander.webp',
  face: '/me/face.webp',
  plumber: '/me/plumber.webp',
}

export function loadPortraits() {
  return Promise.all(
    Object.entries(PORTRAITS).map(
      ([key, src]) =>
        new Promise((resolve) => {
          const img = new Image()
          img.onload = () => resolve([key, img])
          img.onerror = () => resolve([key, null])
          img.src = src
        })
    )
  ).then((pairs) => Object.fromEntries(pairs))
}

// Read the real family names next/font generated for each CSS variable
export function readFonts(el) {
  const cs = getComputedStyle(el)
  const f = (v, fallback) => (cs.getPropertyValue(v).trim() || fallback)
  return {
    archivo: f('--f-archivo', 'sans-serif'),
    cinzel: f('--f-cinzel', 'serif'),
    luckiest: f('--f-luckiest', 'sans-serif'),
    oswald: f('--f-oswald', 'sans-serif'),
    rajdhani: f('--f-rajdhani', 'sans-serif'),
    mono: f('--f-mono', 'monospace'),
  }
}

export function makeCanvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

function drawFit(ctx, img, x, y, h, anchor = 'center') {
  if (!img) return
  const w = (img.width / img.height) * h
  const dx = anchor === 'center' ? x - w / 2 : anchor === 'right' ? x - w : x
  ctx.drawImage(img, dx, y, w, h)
}

function outlined(ctx, text, x, y, fill, stroke, width) {
  ctx.lineJoin = 'round'
  ctx.lineWidth = width
  ctx.strokeStyle = stroke
  ctx.strokeText(text, x, y)
  ctx.fillStyle = fill
  ctx.fillText(text, x, y)
}

const RAINBOW = ['#e8382e', '#f5b800', '#2c9e4b', '#2b6fd6']

function rainbowText(ctx, text, x, y, size, fonts) {
  ctx.font = `${size}px ${fonts.luckiest}`
  ctx.textAlign = 'left'
  let cx = x
  ;[...text].forEach((ch, i) => {
    if (ch !== ' ') outlined(ctx, ch, cx, y, RAINBOW[i % RAINBOW.length], '#1c1c1c', size * 0.14)
    cx += ctx.measureText(ch).width
  })
  return cx
}

// Front covers. Carts are landscape labels; cases are portrait.
export function drawCover(id, imgs, fonts) {
  if (id === 'hyrule' || id === 'castle') {
    const c = makeCanvas(512, 340)
    const ctx = c.getContext('2d')
    if (id === 'hyrule') {
      const g = ctx.createLinearGradient(0, 0, 512, 340)
      g.addColorStop(0, '#0c2333')
      g.addColorStop(1, '#133d2c')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, 512, 340)
      const glow = ctx.createRadialGradient(370, 360, 10, 370, 360, 260)
      glow.addColorStop(0, 'rgba(240,211,106,0.45)')
      glow.addColorStop(1, 'rgba(240,211,106,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, 512, 340)
      drawFit(ctx, imgs.hero, 400, 18, 360)
      ctx.fillStyle = '#f0d36a'
      ctx.shadowColor = 'rgba(240,211,106,0.5)'
      ctx.shadowBlur = 16
      ctx.textAlign = 'left'
      ctx.font = `700 26px ${fonts.cinzel}`
      ctx.fillText('The Legend of', 30, 80)
      ctx.font = `700 76px ${fonts.cinzel}`
      ctx.fillText('Leigh', 26, 150)
      ctx.shadowBlur = 0
      ctx.fillStyle = '#d7e6d8'
      ctx.font = `600 26px ${fonts.cinzel}`
      ctx.fillText('Ocarina of Code', 30, 300)
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, 340)
      g.addColorStop(0, '#5aa8ff')
      g.addColorStop(1, '#bfe0ff')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, 512, 340)
      ctx.fillStyle = '#fff'
      ;[[70, 70, 30], [105, 58, 38], [140, 72, 28]].forEach(([x, y, r]) => {
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      })
      drawFit(ctx, imgs.face, 400, 30, 340)
      rainbowText(ctx, 'Super Leigh', 22, 240, 62, fonts)
      ctx.font = `86px ${fonts.luckiest}`
      outlined(ctx, '64', 26, 322, '#f5b800', '#1c1c1c', 12)
    }
    return c
  }

  const c = makeCanvas(512, 720)
  const ctx = c.getContext('2d')
  if (id === 'attache') {
    const g = ctx.createRadialGradient(256, 220, 20, 256, 300, 520)
    g.addColorStop(0, '#3c3f3a')
    g.addColorStop(1, '#0e0f0e')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 512, 720)
    drawFit(ctx, imgs.agent, 256, 170, 640)
    const r = ctx.createLinearGradient(0, 380, 0, 720)
    r.addColorStop(0, 'rgba(150,20,20,0)')
    r.addColorStop(1, 'rgba(150,20,20,0.75)')
    ctx.fillStyle = r
    ctx.fillRect(0, 0, 512, 720)
    ctx.textAlign = 'left'
    ctx.font = `600 70px ${fonts.oswald}`
    ctx.fillStyle = '#e9e3d6'
    ctx.shadowColor = '#000'
    ctx.shadowBlur = 12
    ctx.fillText('RESIDENT', 30, 100)
    ctx.fillText('DEVELOPER', 30, 172)
    ctx.fillStyle = '#d23a2e'
    ctx.font = `600 120px ${fonts.oswald}`
    ctx.fillText('4', 400, 172)
    ctx.shadowBlur = 0
  } else if (id === 'wasteland') {
    const g = ctx.createLinearGradient(0, 0, 0, 720)
    g.addColorStop(0, '#cdbf8a')
    g.addColorStop(0.55, '#8d8460')
    g.addColorStop(1, '#4d4935')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 512, 720)
    // A wrist terminal screen with Leigh in it
    ctx.fillStyle = '#3b3a33'
    roundRect(ctx, 96, 150, 320, 360, 40)
    ctx.fill()
    ctx.fillStyle = '#061407'
    roundRect(ctx, 116, 170, 280, 320, 30)
    ctx.fill()
    ctx.save()
    roundRect(ctx, 116, 170, 280, 320, 30)
    ctx.clip()
    drawFit(ctx, imgs.vault, 256, 190, 310)
    ctx.restore()
    ctx.textAlign = 'center'
    ctx.font = `64px ${fonts.mono}`
    ctx.fillStyle = '#f4f0e2'
    ctx.shadowColor = '#2b2a22'
    ctx.shadowOffsetY = 4
    ctx.fillText('FULLSTACK 3', 256, 620)
    ctx.shadowOffsetY = 0
  } else if (id === 'normandy') {
    ctx.fillStyle = '#03060d'
    ctx.fillRect(0, 0, 512, 720)
    for (let i = 0; i < 140; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.8})`
      ctx.fillRect(Math.random() * 512, Math.random() * 720, 1.5, 1.5)
    }
    const g = ctx.createRadialGradient(256, 760, 10, 256, 760, 420)
    g.addColorStop(0, 'rgba(255,140,40,0.6)')
    g.addColorStop(1, 'rgba(255,140,40,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 512, 720)
    ctx.globalCompositeOperation = 'screen'
    drawFit(ctx, imgs.commander, 256, 220, 500)
    ctx.globalCompositeOperation = 'source-over'
    ctx.textAlign = 'center'
    ctx.font = `700 54px ${fonts.rajdhani}`
    ctx.fillStyle = '#f2f5f8'
    ctx.fillText('M A S S   D E P L O Y', 256, 110)
    ctx.fillStyle = '#ff9a3c'
    ctx.font = `700 90px ${fonts.rajdhani}`
    ctx.fillText('2', 256, 190)
  }
  return c
}

export function drawDisc(id, color, fonts) {
  const c = makeCanvas(512, 512)
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(256, 256, 40, 256, 256, 256)
  g.addColorStop(0, '#ffffff')
  g.addColorStop(0.2, color)
  g.addColorStop(1, shade(color, -0.35))
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(256, 256, 256, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(256, 256, 40, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#fff'
  const title = { attache: 'RESIDENT DEVELOPER 4', wasteland: 'FULLSTACK 3', normandy: 'MASS DEPLOY 2' }[id] || ''
  ctx.font = `600 36px ${id === 'wasteland' ? fonts.mono : id === 'normandy' ? fonts.rajdhani : fonts.oswald}`
  ctx.fillText(title, 256, 150)
  ctx.font = `20px ${fonts.archivo}`
  ctx.fillText('Starring Leigh Atkins', 256, 400)
  return c
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) * (1 + amt)))
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) * (1 + amt)))
  const b = Math.max(0, Math.min(255, (n & 255) * (1 + amt)))
  return `rgb(${r | 0},${g | 0},${b | 0})`
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// A few frames of static, made once, so the idle screen never reads pixels back
export function makeNoise() {
  return Array.from({ length: 4 }, () => {
    const c = makeCanvas(160, 120)
    const ctx = c.getContext('2d')
    const img = ctx.createImageData(160, 120)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v
      img.data[i + 3] = 255
    }
    ctx.putImageData(img, 0, 0)
    return c
  })
}

// The television with nothing playing: blue input screen and a little snow
export function drawIdle(ctx, t, osd, noise) {
  const { width: w, height: h } = ctx.canvas
  ctx.fillStyle = '#10208a'
  ctx.fillRect(0, 0, w, h)
  if (noise) {
    ctx.globalAlpha = 0.09
    ctx.globalCompositeOperation = 'lighter'
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(noise[Math.floor(t * 14) % noise.length], 0, 0, w, h)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
  }
  ctx.fillStyle = '#7cf27c'
  ctx.font = '28px monospace'
  ctx.textAlign = 'left'
  ctx.fillText('VIDEO 1', 40, 60)
  if (osd) {
    ctx.textAlign = 'center'
    ctx.fillStyle = '#fff'
    ctx.font = '26px monospace'
    ctx.fillText(osd.top, w / 2, h / 2 - 10)
    if (Math.floor(t * 2) % 2 === 0) {
      ctx.fillStyle = '#7cf27c'
      ctx.font = '20px monospace'
      ctx.fillText(osd.bottom, w / 2, h / 2 + 30)
    }
  }
}

// Each game's title screen, animated by t (seconds since power on)
export function drawBoot(ctx, id, imgs, fonts, t) {
  const { width: w, height: h } = ctx.canvas
  const blink = Math.floor(t * 2.2) % 2 === 0
  const fade = Math.min(1, t / 0.8)
  ctx.globalAlpha = 1
  ctx.textAlign = 'center'
  if (id === 'hyrule') {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#20163f')
    g.addColorStop(0.6, '#5b3a6e')
    g.addColorStop(1, '#1c2d1c')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.globalAlpha = fade
    drawFit(ctx, imgs.hero, w * 0.78, h * 0.18, h * 0.82)
    ctx.fillStyle = '#f0d36a'
    ctx.shadowColor = 'rgba(240,211,106,0.7)'
    ctx.shadowBlur = 20
    ctx.font = `700 28px ${fonts.cinzel}`
    ctx.fillText('The Legend of', w * 0.4, h * 0.36)
    ctx.font = `700 92px ${fonts.cinzel}`
    ctx.fillText('Leigh', w * 0.4, h * 0.54)
    ctx.shadowBlur = 0
    ctx.font = `600 26px ${fonts.cinzel}`
    ctx.fillStyle = '#d7e6d8'
    ctx.fillText('Ocarina of Code', w * 0.4, h * 0.63)
    if (blink && t > 1) {
      ctx.fillStyle = '#fff'
      ctx.font = `700 24px ${fonts.archivo}`
      ctx.fillText('PRESS START', w * 0.4, h * 0.86)
    }
  } else if (id === 'castle') {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#2b6fd6')
    g.addColorStop(1, '#8fc6ff')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.globalAlpha = fade
    const bob = Math.sin(t * 3) * 8
    drawFit(ctx, imgs.face, w / 2, h * 0.08 + bob, h * 0.66)
    ctx.textAlign = 'left'
    const end = rainbowText(ctx, 'Super Leigh 64', -1000, -1000, 64, fonts)
    rainbowText(ctx, 'Super Leigh 64', w / 2 - (end + 1000) / 2, h * 0.85, 64, fonts)
    if (blink && t > 1) {
      ctx.textAlign = 'center'
      ctx.font = `30px ${fonts.luckiest}`
      outlined(ctx, 'PRESS START', w / 2, h * 0.95, '#fff', '#1c1c1c', 5)
    }
  } else if (id === 'attache') {
    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, w, h)
    ctx.globalAlpha = fade
    drawFit(ctx, imgs.agent, w * 0.72, h * 0.06, h * 1.2)
    const r = ctx.createLinearGradient(0, h * 0.4, 0, h)
    r.addColorStop(0, 'rgba(120,10,10,0)')
    r.addColorStop(1, 'rgba(120,10,10,0.7)')
    ctx.fillStyle = r
    ctx.fillRect(0, 0, w, h)
    ctx.textAlign = 'left'
    ctx.font = `600 64px ${fonts.oswald}`
    ctx.fillStyle = '#e9e3d6'
    ctx.fillText('RESIDENT', 40, h * 0.36)
    ctx.fillText('DEVELOPER', 40, h * 0.5)
    ctx.fillStyle = '#d23a2e'
    ctx.font = `600 120px ${fonts.oswald}`
    ctx.fillText('4', 360, h * 0.5)
    if (blink && t > 1) {
      ctx.fillStyle = '#e9e3d6'
      ctx.font = `400 24px ${fonts.oswald}`
      ctx.fillText('PRESS ANY BUTTON', 44, h * 0.82)
    }
  } else if (id === 'wasteland') {
    ctx.fillStyle = '#031208'
    ctx.fillRect(0, 0, w, h)
    ctx.globalAlpha = fade
    ctx.fillStyle = '#41f593'
    ctx.font = `20px ${fonts.mono}`
    ctx.textAlign = 'left'
    const lines = ['ROBCO INDUSTRIES (TM) TERMLINK', '> LOAD FULLSTACK3.EXE', '> MOUNTING WRIST TERMINAL...', '> USER: LEIGH ATKINS']
    lines.forEach((l, i) => {
      const shown = Math.max(0, Math.min(l.length, Math.floor((t - i * 0.35) * 30)))
      ctx.fillText(l.slice(0, shown), 36, 60 + i * 30)
    })
    if (t > 1.2) {
      ctx.textAlign = 'center'
      ctx.font = `64px ${fonts.mono}`
      ctx.shadowColor = '#41f593'
      ctx.shadowBlur = 16
      ctx.fillText('FULLSTACK 3', w / 2, h * 0.68)
      ctx.shadowBlur = 0
      if (blink) {
        ctx.font = `22px ${fonts.mono}`
        ctx.fillText('PLEASE STAND BY', w / 2, h * 0.82)
      }
    }
  } else if (id === 'normandy') {
    ctx.fillStyle = '#02040a'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 60; i++) {
      const x = (i * 97.3 + t * 40 * ((i % 3) + 1)) % w
      ctx.fillStyle = `rgba(255,255,255,${0.3 + (i % 5) / 8})`
      ctx.fillRect(x, (i * 53.7) % h, 2, 2)
    }
    ctx.globalAlpha = fade
    ctx.globalCompositeOperation = 'screen'
    drawFit(ctx, imgs.commander, w * 0.5, h * 0.24, h * 0.8)
    ctx.globalCompositeOperation = 'source-over'
    ctx.font = `700 50px ${fonts.rajdhani}`
    ctx.fillStyle = '#f2f5f8'
    ctx.fillText('M A S S   D E P L O Y', w / 2, h * 0.17)
    ctx.fillStyle = '#ff9a3c'
    ctx.font = `700 70px ${fonts.rajdhani}`
    ctx.fillText('2', w / 2, h * 0.3)
    if (blink && t > 1) {
      ctx.fillStyle = '#e9eef4'
      ctx.font = `600 22px ${fonts.rajdhani}`
      ctx.fillText('PRESS START', w / 2, h * 0.94)
    }
  }
  ctx.globalAlpha = 1
}
