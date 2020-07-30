import fulcrumEpubBehavior from '../behaviors/fulcrum/epubs';
import {
  maybePolyfillXPG,
  initRunnableBehavior,
} from '/Users/cjbaik/dev/behaviors/lib';

initRunnableBehavior({
  win: window,
  behaviorStepIterator: fulcrumEpubBehavior({
    $x: maybePolyfillXPG(window.$x),
    getEventListeners: window.getEventListeners,
  }),
  metadata: {
    name: 'fulcrumEpubBehavior',
    displayName: 'Fulcrum Epub',
    functional: true,
    match: {
      regex: /https?:\/\/(www\.)?fulcrum\.org\/epubs\/.+/,
    },
    description: 'Views the content of an Epub',
    updated: '2019-09-23T17:19:38-04:00',
  },
});
