__webpack_public_path__ = (() => {
  const assetPath = window?.NREUM?.info?.assets ||
    self?.NREUM?.info?.assets ||
    globalThis?.NREUM?.info?.assets ||
    process.env.ASSET_PATH

  try {
    const url = new URL(assetPath, 'resolve://')
    return url.toString()
  } catch (e) {
    console.warn('Unable to parse configured asset path for New Relic browser agent.', e)
    return process.env.ASSET_PATH
  }
})()
