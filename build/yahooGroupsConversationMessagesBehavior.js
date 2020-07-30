import yahooGroupConvoMessagesBehavior from '../behaviors/yahoo/groupsConversationMessages';
import {
  maybePolyfillXPG,
  initRunnableBehavior,
} from '/Users/cjbaik/dev/behaviors/lib';

initRunnableBehavior({
  win: window,
  behaviorStepIterator: yahooGroupConvoMessagesBehavior({
    $x: maybePolyfillXPG(window.$x),
    getEventListeners: window.getEventListeners,
  }),
  metadata: {
    name: 'yahooGroupConvoMessagesBehavior',
    displayName: 'Yahoo Group Conversation Messages',
    functional: true,
    match: {
      regex: /^https?:\/\/(?:www\.)?groups\.yahoo\.com\/neo\/groups\/[^/]+\/conversations\/messages(?:[?].+)?$/,
    },
    description: 'Views conversation messages of a Yahoo Group',
    updated: '2019-10-23T15:04:10-04:00',
  },
});
