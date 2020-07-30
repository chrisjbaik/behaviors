import facebookUserFeed, { postStep } from '../behaviors/facebook/userFeed';
import {
  maybePolyfillXPG,
  initRunnableBehavior,
} from '/Users/cjbaik/dev/behaviors/lib';

initRunnableBehavior({
  win: window,
  behaviorStepIterator: facebookUserFeed({
    $x: maybePolyfillXPG(window.$x),
    getEventListeners: window.getEventListeners,
  }),
  postStepFN: postStep,
  metadata: {
    name: 'facebookUserFeed',
    displayName: 'Facebook Page',
    match: {
      regex: /^https?:\/\/(www\.)?facebook\.com\/[^/]+\/?$/,
    },
    description:
      'Capture all items and comments in the Facebook page and scroll down to load more content where possible.',
    updated: '2019-08-21T14:52:23-07:00',
  },
});
