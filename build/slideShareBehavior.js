import slideShareBehavior from '../behaviors/slideShare';
import {
  maybePolyfillXPG,
  initRunnableBehavior,
} from '/Users/cjbaik/dev/behaviors/lib';

initRunnableBehavior({
  win: window,
  behaviorStepIterator: slideShareBehavior({
    $x: maybePolyfillXPG(window.$x),
    getEventListeners: window.getEventListeners,
  }),
  metadata: {
    name: 'slideShareBehavior',
    displayName: 'SlideShare',
    functional: true,
    match: {
      regex: /^(?:https?:\/\/(?:www\.)?)slideshare\.net\/.+/,
    },
    description:
      'Capture each slide contained in the slide deck. If there are multiple slide decks, view and capture each deck.',
    updated: '2019-08-21T14:52:23-07:00',
  },
});
