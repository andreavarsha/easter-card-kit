/**
 * Extracts dominant colour and palette from image buffers using colorthief.
 * Writes to a temp dir internally — callers pass raw Buffers, not file paths.
 */
import { writeFile, mkdir, rm } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { getColor, getPalette } from 'colorthief'

function imageExt(buffer) {
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'png'
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[8] === 0x57 && buffer[9] === 0x45) return 'webp'
  return 'jpg'
}

/**
 * @param {Buffer} logoBuffer
 * @param {Buffer[]} collectionBuffers
 * @returns {Promise<{ dominant: string, palette: string[] }>}
 *   dominant — single hex string from the logo
 *   palette  — deduplicated hex strings: 5 from logo + up to 3 per collection image
 */
export async function extractColors(logoBuffer, collectionBuffers) {
  const tmpDir = join(tmpdir(), `ec-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  await mkdir(tmpDir, { recursive: true })

  try {
    const logoPath = join(tmpDir, `logo.${imageExt(logoBuffer)}`)
    await writeFile(logoPath, logoBuffer)

    const collectionPaths = []
    for (let i = 0; i < collectionBuffers.length; i++) {
      const p = join(tmpDir, `col_${i}.${imageExt(collectionBuffers[i])}`)
      await writeFile(p, collectionBuffers[i])
      collectionPaths.push(p)
    }

    // colorthief v3 returns ColorImpl objects — use .hex() to get the hex string
    const dominant = (await getColor(logoPath)).hex()
    const logoPalette = (await getPalette(logoPath, { colorCount: 5 })).map(c => c.hex())

    const collectionHexes = []
    for (const p of collectionPaths) {
      const swatches = await getPalette(p, { colorCount: 3 })
      collectionHexes.push(...swatches.map(c => c.hex()))
    }

    // Deduplicate, keeping logo palette order first
    const seen = new Set()
    const palette = []
    for (const hex of [...logoPalette, ...collectionHexes]) {
      const norm = hex.toLowerCase()
      if (!seen.has(norm)) {
        seen.add(norm)
        palette.push(hex)
      }
    }

    return { dominant, palette }
  } finally {
    rm(tmpDir, { recursive: true, force: true }).catch(() => {})
  }
}
