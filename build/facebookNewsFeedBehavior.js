import facebookNewsFeed, { postStep } from '../behaviors/facebook/newsFeed';
import {
  maybePolyfillXPG,
  initRunnableBehavior,
} from '/Users/cjbaik/dev/behaviors/lib';

initRunnableBehavior({
  win: window,
  behaviorStepIterator: facebookNewsFeed({
    $x: maybePolyfillXPG(window.$x),
    getEventListeners: window.getEventListeners,
  }),
  postStepFN: postStep,
  metadata: {
    name: 'facebookNewsFeed',
    displayName: 'Facebook Timeline',
    match: {
      regex: /^https?:\/\/(www\.)?facebook\.com(\/)?([?]sk=nf)?$/,
    },
    description:
      'Capture all items and comments in the Facebook timeline and scroll down to load more.',
    updated: '2019-08-21T14:52:23-07:00',
  },
});
