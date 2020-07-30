import youtubeVideoBehavior from '../behaviors/youtubeVideo';
import {
  maybePolyfillXPG,
  initRunnableBehavior,
} from '/Users/cjbaik/dev/behaviors/lib';

initRunnableBehavior({
  win: window,
  behaviorStepIterator: youtubeVideoBehavior({
    $x: maybePolyfillXPG(window.$x),
    getEventListeners: window.getEventListeners,
  }),
  metadata: {
    name: 'youtubeVideoBehavior',
    displayName: 'Youtube',
    functional: true,
    match: {
      regex: /^(?:https?:\/\/(?:www\.)?)?youtube\.com\/watch[?]v=.+/,
    },
    description: 'Capture the YouTube video and all comments.',
    updated: '2019-08-21T14:52:23-07:00',
  },
});
