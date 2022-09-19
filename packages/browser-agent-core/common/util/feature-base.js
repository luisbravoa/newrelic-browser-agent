import { ee } from '../event-emitter/contextual-ee'

class FeatureBase {
  constructor(agentIdentifier, aggregator, featureName, externalFeatures = []) {
    this.agentIdentifier = agentIdentifier
    this.aggregator = aggregator
    this.ee = ee.get(agentIdentifier)
    this.externalFeatures = externalFeatures
    this.featureName = featureName
  }
}
export class InstrumentBase extends FeatureBase {
  constructor(agentIdentifier, aggregator, featureName, externalFeatures = []) {
    super(agentIdentifier, aggregator, featureName, externalFeatures)
    this.completed = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }

  async importAggregator() {
    try {
      const { Aggregate } = await import(`../../features/${this.featureName}/aggregate`)
      new Aggregate(this.agentIdentifier, this.aggregator)
      this.resolve()
    } catch (err) {
      this.reject(err)
    }
  }
}

export class AggregateBase extends FeatureBase {
  constructor(agentIdentifier, aggregator, featureName, externalFeatures = []) {
    super(agentIdentifier, aggregator, featureName, externalFeatures)
  }
}