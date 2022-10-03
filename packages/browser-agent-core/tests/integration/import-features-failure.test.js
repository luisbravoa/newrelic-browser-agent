
import t from '../utils/JILtoJest'
import {setup} from '../utils/setup'
import {ee} from '../../common/event-emitter/contextual-ee'
import { onWindowLoad } from '../../common/window/load'
import agentIdentifier from '../../../../cdn/shared/agentIdentifier'
import {stageAggregator} from '../../../../cdn/agent-loader/utils/importAggregator'
import {Instrument} from '../../features/page-view-event/instrument/index'

new Instrument(agentIdentifier);

/* There's no need to mock a failed feature import, as the original production code, e.g.:
    > import(`@newrelic/browser-agent-core/features/${featureName}/aggregate`)
    will naturally fail with a "cannot find module" in browser tests.
*/

test("import features failure", done => {
  stageAggregator("lite");

  onWindowLoad(function () {
    setTimeout(() => {
      t.ok(ee.aborted, "global EE is aborted");
      done()
    }, 0)
  });
})