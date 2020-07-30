import deathImitatesLanguageBehavior from '../behaviors/deathImitatesLanguageBehavior';
import {
  maybePolyfillXPG,
  initRunnableBehavior,
} from '/Users/cjbaik/dev/behaviors/lib';

initRunnableBehavior({
  win: window,
  behaviorStepIterator: deathImitatesLanguageBehavior({
    $x: maybePolyfillXPG(window.$x),
    getEventListeners: window.getEventListeners,
  }),
  metadata: {
    name: 'deathImitatesLanguageBehavior',
    match: {
      regex: /^(?:https?:\/\/(?:www\.)?)?deathimitateslanguage\.harmvandendorpel\.com\/?$/,
    },
    description:
      'Scrolls the page clicking all the images rendered at the current scroll level',
    updated: '2019-08-21T14:52:23-07:00',
  },
});
