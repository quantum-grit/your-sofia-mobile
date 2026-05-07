import {createSignal} from '../../lib/payload'
import type {CreateSignalInput} from '../../types/signal'

describe('createSignal auth regression', () => {
  const signalData: CreateSignalInput = {
    title: 'Overflowing container',
    description: 'Container is full',
    category: 'waste-container',
    location: {
      latitude: 42.6977,
      longitude: 23.3219,
    },
    reporterUniqueId: 'device-123',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn() as unknown as typeof fetch
  })

  it('sends JWT auth header when creating a signal without photos', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({id: 'sig-1'}),
    })

    await createSignal(signalData, undefined, 'device-123', 'jwt-token-123')

    expect(global.fetch).toHaveBeenCalledTimes(1)

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0]
    expect(url).toContain('/api/signals')
    expect(options).toMatchObject({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'JWT jwt-token-123',
      },
    })
  })

  it('sends JWT auth header for both media upload and signal creation when photos are provided', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({doc: {id: 'img-1'}}),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({id: 'sig-2'}),
      })

    await createSignal(
      signalData,
      [{uri: 'file:///tmp/photo.jpg', type: 'image/jpeg', name: 'photo.jpg'}],
      'device-123',
      'jwt-token-123'
    )

    expect(global.fetch).toHaveBeenCalledTimes(2)

    const [mediaUrl, mediaOptions] = (global.fetch as jest.Mock).mock.calls[0]
    expect(mediaUrl).toContain('/api/media')
    expect(mediaOptions).toMatchObject({
      method: 'POST',
      headers: {
        Authorization: 'JWT jwt-token-123',
      },
    })

    const [signalUrl, signalOptions] = (global.fetch as jest.Mock).mock.calls[1]
    expect(signalUrl).toContain('/api/signals')
    expect(signalOptions).toMatchObject({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'JWT jwt-token-123',
      },
    })

    const parsedBody = JSON.parse(signalOptions.body as string)
    expect(parsedBody.images).toEqual(['img-1'])
  })
})
