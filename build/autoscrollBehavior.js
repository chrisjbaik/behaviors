import autoScrollBehavior from '../behaviors/autoscroll';
import {
  maybePolyfillXPG,
  initRunnableBehavior,
} from '/Users/cjbaik/dev/behaviors/lib';

initRunnableBehavior({
  win: window,
  behaviorStepIterator: autoScrollBehavior({
    $x: maybePolyfillXPG(window.$x),
    getEventListeners: window.getEventListeners,
  }),
  metadata: {
    name: 'autoScrollBehavior',
    functional: true,
    displayName: 'Default Scrolling',
    defaultBehavior: true,
    description:
      'Default behavior for any page. Automatically scrolls down the page as much as possible. If additional content loads that increases page height, scrolling will continue until autopilot is stopped by user. Any discovered audio/video is played, but no other interactions are performed.',
    updated: '2019-08-21T14:52:23-07:00',
  },
});
