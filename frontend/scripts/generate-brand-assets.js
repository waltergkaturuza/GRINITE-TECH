/**
 * Renders crawlable PNG brand assets from QUANTIS-1.svg via headless Chrome.
 * Google Search prefers a raster logo (PNG) of at least 112x112, plus a 48px-multiple favicon.
 */
const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')

const frontendDir = path.join(__dirname, '..')
const publicDir = path.join(frontendDir, 'public')
const appDir = path.join(frontendDir, 'src', 'app')
const svgPath = path.join(publicDir, 'QUANTIS-1.svg')
const svgUrl = 'file:///' + svgPath.replace(/\\/g, '/')
const chrome =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

if (!fs.existsSync(chrome)) {
  console.error('Chrome not found at', chrome)
  process.exit(1)
}
if (!fs.existsSync(svgPath)) {
  console.error('SVG not found at', svgPath)
  process.exit(1)
}

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'quantis-brand-'))
const profileDir = path.join(tmpRoot, 'chrome-profile')
fs.mkdirSync(profileDir)

function writeHtml(name, html) {
  const file = path.join(tmpRoot, name)
  fs.writeFileSync(file, html, 'utf8')
  return 'file:///' + file.replace(/\\/g, '/')
}

function screenshot(htmlUrl, outFile, width, height) {
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    `--user-data-dir=${profileDir}`,
    `--force-device-scale-factor=1`,
    `--window-size=${width},${height}`,
    `--screenshot=${outFile}`,
    '--virtual-time-budget=12000',
    '--timeout=20000',
    htmlUrl,
  ]
  const result = spawnSync(chrome, args, { stdio: 'inherit', windowsHide: true })
  if (result.status !== 0) {
    throw new Error(`Chrome screenshot failed for ${outFile} (status ${result.status})`)
  }
  if (!fs.existsSync(outFile) || fs.statSync(outFile).size < 1000) {
    throw new Error(`Screenshot missing or too small: ${outFile}`)
  }
  console.log('wrote', outFile, fs.statSync(outFile).size, 'bytes')
}

const fullHtml = writeHtml(
  'logo-full.html',
  `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; width: 1600px; height: 572px; background: #ffffff; overflow: hidden; }
  img { display: block; width: 1480px; height: auto; margin: 28px auto 0; }
</style>
</head>
<body>
  <img src="${svgUrl}" alt="Quantis Technologies" />
</body>
</html>`
)

const markHtml = writeHtml(
  'logo-mark.html',
  `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; width: 512px; height: 512px; background: #ffffff; overflow: hidden; }
  .crop { width: 512px; height: 512px; overflow: hidden; }
  img { display: block; height: 500px; width: auto; margin-top: 6px; margin-left: 12px; }
</style>
</head>
<body>
  <div class="crop">
    <img src="${svgUrl}" alt="Quantis Technologies" />
  </div>
</body>
</html>`
)

const mark192Html = writeHtml(
  'logo-mark-192.html',
  `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; width: 192px; height: 192px; background: #ffffff; overflow: hidden; }
  .crop { width: 192px; height: 192px; overflow: hidden; }
  img { display: block; height: 188px; width: auto; margin-top: 2px; margin-left: 6px; }
</style>
</head>
<body>
  <div class="crop">
    <img src="${svgUrl}" alt="Quantis Technologies" />
  </div>
</body>
</html>`
)

const appleHtml = writeHtml(
  'logo-apple.html',
  `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; width: 180px; height: 180px; background: #ffffff; overflow: hidden; }
  .crop { width: 180px; height: 180px; overflow: hidden; }
  img { display: block; height: 176px; width: auto; margin-top: 2px; margin-left: 6px; }
</style>
</head>
<body>
  <div class="crop">
    <img src="${svgUrl}" alt="Quantis Technologies" />
  </div>
</body>
</html>`
)

const ogHtml = writeHtml(
  'og.html',
  `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; width: 1200px; height: 630px; overflow: hidden; font-family: Arial, Helvetica, sans-serif; }
  body {
    background: linear-gradient(135deg, #1f2937 0%, #111827 55%, #7f1d1d 140%);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .card {
    width: 1080px;
    display: flex;
    align-items: center;
    gap: 48px;
  }
  .plate {
    flex: 0 0 420px;
    background: #ffffff;
    border-radius: 28px;
    padding: 28px 24px;
    box-sizing: border-box;
  }
  .plate img { display: block; width: 100%; height: auto; }
  .copy { flex: 1; }
  h1 { margin: 0 0 16px; font-size: 52px; line-height: 1.1; letter-spacing: -0.03em; }
  p { margin: 0; font-size: 24px; line-height: 1.45; color: #e5e7eb; }
</style>
</head>
<body>
  <div class="card">
    <div class="plate">
      <img src="${svgUrl}" alt="Quantis Technologies" />
    </div>
    <div class="copy">
      <h1>Quantis Technologies</h1>
      <p>Enterprise systems, cloud &amp; DevOps, data intelligence, automation, cybersecurity, and digital platforms for Zimbabwe and Africa.</p>
    </div>
  </div>
</body>
</html>`
)

const outLogo = path.join(publicDir, 'quantis-logo.png')
const outMark = path.join(publicDir, 'quantis-mark.png')
const outIcon192 = path.join(publicDir, 'icon-192.png')
const outApple = path.join(publicDir, 'apple-touch-icon.png')
const outOg = path.join(publicDir, 'quantis-og.png')

screenshot(fullHtml, outLogo, 1600, 572)
screenshot(markHtml, outMark, 512, 512)
screenshot(mark192Html, outIcon192, 192, 192)
screenshot(appleHtml, outApple, 180, 180)
screenshot(ogHtml, outOg, 1200, 630)

fs.copyFileSync(outIcon192, path.join(appDir, 'icon.png'))
fs.copyFileSync(outApple, path.join(appDir, 'apple-icon.png'))

console.log('brand assets ready')
