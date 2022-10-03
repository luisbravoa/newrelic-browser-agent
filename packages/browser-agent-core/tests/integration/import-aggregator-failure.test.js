
import t from '../utils/JILtoJest'
import {setup} from '../utils/setup'
import {ee} from '../../common/event-emitter/contextual-ee'
import { onWindowLoad } from '../../common/window/load'
import {stageAggregator} from '../../../../cdn/agent-loader/utils/importAggregator'
import * as testAggregatorM from '../../../../cdn/agent-aggregator/aggregator'
import {Instrument} from '../../features/page-view-event/instrument/index'

const {agentIdentifier} = setup();
new Instrument(agentIdentifier);

/**
 * Falsifying some network error while attempting to load main aggregator (and all feature aggs). This is a level above previous features test.
 */
/* eslint-disable */
testAggregatorM.aggregator = async function(build) {
  throw new Error("(Fake) A network error occurred importing 'aggregator.js'.");
}
test("import main aggregator failure", done => {
  stageAggregator("lite");

  onWindowLoad(function () {
    setTimeout(() => {
      t.ok(ee.aborted, "global EE is aborted");
      done()
    }, 0)
  });
})