import {ee} from '../event-emitter/contextual-ee'

export class FeatureBase {
  constructor(agentIdentifier, aggregator, featureName, externalFeatures = []) {
    this.agentIdentifier = agentIdentifier
    this.aggregator = aggregator
    this.ee = ee.get(agentIdentifier)
    this.externalFeatures = externalFeatures
    this.featureName = featureName
  }

  async importAggregator(){
    console.log("import aggregator...", this.featureName)
    const {Aggregate} = await import(`../../features/${this.featureName}/aggregate`)
    new Aggregate(this.agentIdentifier, this.aggregator)
  }

}
