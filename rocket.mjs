import sharp from 'sharp'
import fetch from 'node-fetch'

sharp.cache(false)

const now = new Date()
const h = now.getHours()
const m = now.getMinutes()

let v = Math.round(h * 100 + (m / 60 * 100))
let p = 0

if (v < 800) {
  p = v / 720 * 1.1 * 100
}

if (h > 6 && h < 8) {
  p = 100 
}

let brightness = Number(process.env.BRIGHTNESS || 10)
if (h > 6 && h < 19) {
  brightness = 50
}

const device = process.env.DEVICE
const apikey = process.env.APIKEY

const render = async res => {
  const composites = []

  const svg = `
    <svg width="32" fill="black" height="64" viewBox="0 0 32 64" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <filter id="crispify">
          <feComponentTransfer>
            <feFuncA type="discrete" tableValues="0 1"/>
          </feComponentTransfer>
        </filter>
        <defs>
          <clipPath id="cut-off-top">
            <rect x="0" y="${55 - (55 / 100 * p)}" width="32" height="64" />
          </clipPath>
        </defs>
      </defs>

      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="-1px"
        viewBox="0 0 32 64"  xml:space="preserve">
        <g style="stroke: rgba(255,255,255,.7); stroke-width: 0.7px; stroke-linejoin: round;" transform="matrix(2.6 0 0 2.6 2.5 -8.5)">
          <path style="fill: transparent;" d="M6.2,17.6c1.7,1.6-0.6,3.4-1,6.1c-0.5-2.7-2.7-4.5-1.1-6.1C4.8,17.7,5.5,17.7,6.2,17.6z"/>
          <path style="fill: transparent;" d="M2,14.8l-2.1,3.1c-0.1,0.1-0.1,0.3-0.1,0.4l0,2.1c0,0.2,0.3,0.3,0.4,0.2l2.5-2.1C2.6,17.2,2.4,15.9,2,14.8
            L2,14.8z"/>
          <path style="fill: transparent;" d="M8.4,14.8l2.1,3.1c0.1,0.1,0.1,0.3,0.1,0.4v2.1c0,0.2-0.3,0.3-0.4,0.2l-2.5-2.1C7.8,17.2,8,15.9,8.4,14.8
            L8.4,14.8z"/>
          <path style="fill: transparent;" d="M7.8,18.5c0.5-1.5,0.8-3.4,0.8-5.5c0-4.7-1.5-8.6-3.3-8.9c-1.9,0.3-3.3,4.2-3.3,8.9c0,2.1,0.3,4,0.8,5.5
            L7.8,18.5z"/>
          <path style="fill: transparent;" d="M8.3,9.5c-0.5-3-1.7-5.2-3-5.4c-1.4,0.2-2.5,2.4-3,5.4H8.3z"/>
          <circle style="fill: transparent;" cx="5.2" cy="12.3" r="1.3"/>
        </g>
      </svg>
      <g clip-path="url(#cut-off-top)"> 
        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="-1px"
          viewBox="0 0 32 64" xml:space="preserve">
          <style type="text/css">
            .st0{fill:#FFD215;}
            .st1{fill:#6820AA;}
            .st2{fill:#FF1494;}
            .st3{fill:#F9F9F9;}
          </style>
          <g transform="matrix(2.6 0 0 2.6 2.5 -8.5)">
            <path class="st0" d="M6.2,17.6c1.7,1.6-0.6,3.4-1,6.1c-0.5-2.7-2.7-4.5-1.1-6.1C4.8,17.7,5.5,17.7,6.2,17.6z"/>
            <path class="st1" d="M2,14.8l-2.1,3.1c-0.1,0.1-0.1,0.3-0.1,0.4l0,2.1c0,0.2,0.3,0.3,0.4,0.2l2.5-2.1C2.6,17.2,2.4,15.9,2,14.8
              L2,14.8z"/>
            <path class="st1" d="M8.4,14.8l2.1,3.1c0.1,0.1,0.1,0.3,0.1,0.4v2.1c0,0.2-0.3,0.3-0.4,0.2l-2.5-2.1C7.8,17.2,8,15.9,8.4,14.8
              L8.4,14.8z"/>
            <path class="st2" d="M7.8,18.5c0.5-1.5,0.8-3.4,0.8-5.5c0-4.7-1.5-8.6-3.3-8.9c-1.9,0.3-3.3,4.2-3.3,8.9c0,2.1,0.3,4,0.8,5.5
              L7.8,18.5z"/>
            <path class="st1" d="M8.3,9.5c-0.5-3-1.7-5.2-3-5.4c-1.4,0.2-2.5,2.4-3,5.4H8.3z"/>
            <circle class="st3" cx="5.2" cy="12.3" r="1.3"/>
          </g>
        </svg>
      </g>

      <text filter="url(x#crispify)" text-anchor="middle" x="16" y="63" fill="white" style="font-family: Arial; font-weight: 800; font-size: 12px">
        ${h > 12 ? h - 12 : h}:${String(m).length < 2 ? '0' : ''}${m}
        <!-- ${p} -->
      </text>
    </svg>
  `
  
  composites.push({ input: await sharp(Buffer.from(svg)).rotate(90).png().toBuffer(), top: 0, left: 0 })

  const output =
    await sharp({ create: { width: 64, height: 32, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 }, } })
      .ensureAlpha().composite(composites).gif().toBuffer()
  
  const buf = Buffer.from(output, 'binary')

  // Update the brightness (for later, TODO, programmatically based on time of day)
  await fetch('https://api.tidbyt.com/v0/devices/' + device, {
    method: 'PATCH', headers: { 'Content-type': 'application/json', 'Authorization': 'Bearer ' + apikey },
    body: JSON.stringify({ brightness, autoDim: false, })
  })

  // Set the image
  const f = await fetch('https://api.tidbyt.com/v0/devices/' + device + '/push', {
    method: 'POST',
    headers: { 'Content-type': 'application/json', 'Authorization': 'Bearer ' + apikey },
    body: JSON.stringify({ image: buf.toString('base64'), background: false, installationID: 'nodejs', })
  })

  console.log('Rendered & live', await f.json())

  return buf
}

render()
