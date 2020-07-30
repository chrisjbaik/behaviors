import twitterTimelineBehavior from '../behaviors/twitter/twitterAll';
import {
  maybePolyfillXPG,
  initRunnableBehavior,
} from '/Users/cjbaik/dev/behaviors/lib';

initRunnableBehavior({
  win: window,
  behaviorStepIterator: twitterTimelineBehavior({
    $x: maybePolyfillXPG(window.$x),
    getEventListeners: window.getEventListeners,
  }),
  metadata: {
    name: 'twitterTimelineBehavior',
    displayName: 'Twitter Timeline',
    functional: true,
    match: {
      regex: /^(?:https?:[/]{2}(?:www[.])?)?twitter[.]com[/]?.*/,
    },
    description:
      'Capture every tweet, including quotes, embedded videos, images, replies and/or related tweets in thread.',
    updated: '2020-04-27T00:00:00Z',
  },
});
