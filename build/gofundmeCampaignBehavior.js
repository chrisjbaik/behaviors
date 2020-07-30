import gofundmeCampaignBehavior from '../behaviors/gofundme/campaign';
import {
  maybePolyfillXPG,
  initRunnableBehavior,
} from '/Users/cjbaik/dev/behaviors/lib';

initRunnableBehavior({
  win: window,
  behaviorStepIterator: gofundmeCampaignBehavior({
    $x: maybePolyfillXPG(window.$x),
    getEventListeners: window.getEventListeners,
  }),
  metadata: {
    name: 'gofundmeCampaignBehavior',
    displayName: 'GoFundMe Campaign',
    functional: true,
    match: {
      regex: /^https?:\/\/(www\.)?gofundme\.com\/f\/[^/]+(?:\/)?$/,
    },
    description: 'Capture and expand all updates, comments, and donations.',
  },
});
