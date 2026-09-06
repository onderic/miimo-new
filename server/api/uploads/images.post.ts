import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { requireAdmin } from '../../utils/auth'

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])
const maxSize = 5 * 1024 * 1024

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const parts = await readMultipartFormData(event)
  const image = parts?.find(part => part.name === 'image' && part.filename)

  if (!image?.type || !allowedTypes.has(image.type)) {
    throw createError({ statusCode: 422, statusMessage: 'Upload a JPG, PNG, WebP, or GIF image' })
  }
  if (image.data.length > maxSize) {
    throw createError({ statusCode: 413, statusMessage: 'Images must be 5 MB or smaller' })
  }

  const extension = extname(image.filename || '').toLowerCase()
  if (!allowedExtensions.has(extension)) {
    throw createError({ statusCode: 422, statusMessage: 'Invalid image extension' })
  }

  const filename = `${randomUUID()}${extension}`
  const uploadDirectory = process.env.UPLOAD_DIRECTORY || join(process.cwd(), 'uploads')
  await mkdir(uploadDirectory, { recursive: true })
  await writeFile(join(uploadDirectory, filename), image.data, { flag: 'wx' })

  return { url: `/uploads/${filename}` }
})
