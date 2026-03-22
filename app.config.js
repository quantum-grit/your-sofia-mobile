// Set NODE_ENV if not already set (required for Android builds)
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

module.exports = ({config}) => ({
  ...config,
  ios: {
    ...config.ios,
    infoPlist: {
      ...(config.ios?.infoPlist ?? {}),
      NSMotionUsageDescription:
        'Used to show nearby waste containers in the augmented reality camera view.',
    },
  },
  android: {
    ...config.android,
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY,
      },
    },
    permissions: [...(config.android?.permissions ?? []), 'ACTIVITY_RECOGNITION'],
  },
})
