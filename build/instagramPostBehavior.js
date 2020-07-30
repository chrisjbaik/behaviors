import instagramPostBehavior from '../behaviors/instagram/post';
import {
  maybePolyfillXPG,
  initRunnableBehavior,
} from '/Users/cjbaik/dev/behaviors/lib';

initRunnableBehavior({
  win: window,
  behaviorStepIterator: instagramPostBehavior({
    $x: maybePolyfillXPG(window.$x),
    getEventListeners: window.getEventListeners,
  }),
  metadata: {
    name: 'instagramPostBehavior',
    displayName: 'Instagram Post',
    functional: true,
    match: {
      regex: /^https?:\/\/(www\.)?instagram\.com\/p\/[^/]+(?:\/)?$/,
    },
    description:
      'Capture every image and/or video, retrieve all comments, and scroll down to load more.',
    updated: '2019-10-11T17:08:12-04:00',
  },
});
