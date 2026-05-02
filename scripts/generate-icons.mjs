import sharp from 'sharp'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#f59e0b"/>
  <text x="256" y="320" text-anchor="middle" font-size="280" font-family="Arial">⭐</text>
</svg>`

for (const size of [192, 512]) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}.png`)
  console.log(`Generated icon-${size}.png`)
}
