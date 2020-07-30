import instagramUserBehavior from '../behaviors/instagram/user';
import {
  maybePolyfillXPG,
  initRunnableBehavior,
} from '/Users/cjbaik/dev/behaviors/lib';

initRunnableBehavior({
  win: window,
  behaviorStepIterator: instagramUserBehavior({
    $x: maybePolyfillXPG(window.$x),
    getEventListeners: window.getEventListeners,
  }),
  metadata: {
    name: 'instagramUserBehavior',
    displayName: 'Instagram User Page',
    functional: true,
    match: {
      regex: /^https?:\/\/(www\.)?instagram\.com\/[^/]+(?:\/(?:[?].+)?(?:tagged(?:\/)?)?)?$/,
    },
    description:
      'Capture all stories, images, videos and comments on user’s page.',
    updated: '2019-10-11T17:08:12-04:00',
  },
});
