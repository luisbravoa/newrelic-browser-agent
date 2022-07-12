export class Configurable {
  constructor(obj, model) {
    if (!obj || typeof obj !== 'object') return console.error('setting a Configurable requires an object as input')
    if (!model || typeof model !== 'object') return console.error('setting a Configurable requires a model to set its initial properties')
    Object.assign(this, model)
    Object.entries(obj).forEach(([key, value]) => {
      // Ensure any customized k-v setting, whether key exists or not, gets applied to template (aka 'model')
      this[key] = value
    })
  }
}
