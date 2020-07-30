import soundCloudArtistBehavior from '../behaviors/soundcloud/artist';
import {
  maybePolyfillXPG,
  initRunnableBehavior,
} from '/Users/cjbaik/dev/behaviors/lib';

initRunnableBehavior({
  win: window,
  behaviorStepIterator: soundCloudArtistBehavior({
    $x: maybePolyfillXPG(window.$x),
    getEventListeners: window.getEventListeners,
  }),
  metadata: {
    name: 'soundCloudArtistBehavior',
    displayName: 'Soundcloud Profile',
    functional: true,
    match: {
      regex: /^(?:https?:\/\/(?:www\.)?)?soundcloud\.com\/(?!(?:discover|stream))[^/]+(?:\/(?:tracks|albums|sets|reposts))?(?:\/)?$/,
    },
    description: 'Capture every track on Soundcloud profile.',
    updated: '2019-08-21T14:52:23-07:00',
  },
});
