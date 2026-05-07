import {getMediaUrl} from '../../lib/payload'

describe('getMediaUrl', () => {
  it('prefixes API host for relative string URLs', () => {
    const result = getMediaUrl('/media/photo.jpg')
    expect(result).toContain('/media/photo.jpg')
    expect(result).toMatch(/^https?:\/\//)
  })

  it('does not double-prefix absolute string URLs', () => {
    const result = getMediaUrl('https://your.sofia.bg/media/photo.jpg')
    expect(result).toBe('https://your.sofia.bg/media/photo.jpg')
  })

  it('prefixes API host for relative object URLs', () => {
    const result = getMediaUrl({url: '/media/object-photo.jpg'})
    expect(result).toContain('/media/object-photo.jpg')
    expect(result).toMatch(/^https?:\/\//)
  })

  it('does not double-prefix absolute object URLs', () => {
    const result = getMediaUrl({url: 'https://your.sofia.bg/media/object-photo.jpg'})
    expect(result).toBe('https://your.sofia.bg/media/object-photo.jpg')
  })
})
