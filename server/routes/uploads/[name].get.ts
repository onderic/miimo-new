import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { extname, join } from 'node:path'

const contentTypes: Record<string, string> = {
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp'
}

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name')
  if (!name || !/^[a-z0-9](?:[a-z0-9_-]*[a-z0-9])?\.(?:jpe?g|png|webp|gif)$/i.test(name)) {
    throw createError({ statusCode: 404, statusMessage: 'Image not found' })
  }

  const uploadDirectory = process.env.UPLOAD_DIRECTORY || join(process.cwd(), 'uploads')
  const filePath = join(uploadDirectory, name)
  try {
    await stat(filePath)
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Image not found' })
  }

  setHeader(event, 'content-type', contentTypes[extname(name)] || 'application/octet-stream')
  setHeader(event, 'cache-control', 'public, max-age=31536000, immutable')
  return sendStream(event, createReadStream(filePath))
})
