import soundCloudEmbedBehavior from '../behaviors/soundcloud/embed';
import {
  maybePolyfillXPG,
  initRunnableBehavior,
} from '/Users/cjbaik/dev/behaviors/lib';

initRunnableBehavior({
  win: window,
  behaviorStepIterator: soundCloudEmbedBehavior({
    $x: maybePolyfillXPG(window.$x),
    getEventListeners: window.getEventListeners,
  }),
  metadata: {
    name: 'soundCloudEmbedBehavior',
    displayName: 'Soundcloud Embed',
    functional: true,
    match: {
      regex: /^https?:\/\/w\.soundcloud\.com\/player\/.+/,
    },
    description: 'Capture every track in the Soundcloud embed.',
    updated: '2019-08-21T14:52:23-07:00',
  },
});
