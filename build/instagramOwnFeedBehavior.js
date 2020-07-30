import instagramOwnFeedBehavior from '../behaviors/instagram/ownFeed';
import {
  maybePolyfillXPG,
  initRunnableBehavior,
} from '/Users/cjbaik/dev/behaviors/lib';

initRunnableBehavior({
  win: window,
  behaviorStepIterator: instagramOwnFeedBehavior({
    $x: maybePolyfillXPG(window.$x),
    getEventListeners: window.getEventListeners,
  }),
  metadata: {
    name: 'instagramOwnFeedBehavior',
    displayName: 'Instagram User Feed',
    functional: true,
    match: {
      regex: /^https?:\/\/(www\.)?instagram\.com(?:\/)?$/,
    },
    description:
      'Capture all stories, images, videos and comments on the logged in users feed.',
    updated: '2019-10-11T17:08:12-04:00',
  },
});
