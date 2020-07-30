module.exports = {
  defaultBehavior: {
    name: 'autoScrollBehavior',
    functional: true,
    displayName: 'Default Scrolling',
    defaultBehavior: true,
    description: 'Default behavior for any page. Automatically scrolls down the page as much as possible. If additional content loads that increases page height, scrolling will continue until autopilot is stopped by user. Any discovered audio/video is played, but no other interactions are performed.',
    updated: '2019-08-21T14:52:23-07:00',
    fileName: 'autoscrollBehavior.js'
  },
  behaviors: [
    {
      name: 'deathImitatesLanguageBehavior',
      match: {
        regex: /^(?:https?:\/\/(?:www\.)?)?deathimitateslanguage\.harmvandendorpel\.com\/?$/
      },
      description: 'Scrolls the page clicking all the images rendered at the current scroll level',
      updated: '2019-08-21T14:52:23-07:00',
      fileName: 'deathImitatesLanguageBehavior.js'
    },
    {
      name: 'slideShareBehavior',
      displayName: 'SlideShare',
      functional: true,
      match: {
        regex: /^(?:https?:\/\/(?:www\.)?)slideshare\.net\/.+/
      },
      description: 'Capture each slide contained in the slide deck. If there are multiple slide decks, view and capture each deck.',
      updated: '2019-08-21T14:52:23-07:00',
      fileName: 'slideShareBehavior.js'
    },
    {
      name: 'youtubeVideoBehavior',
      displayName: 'Youtube',
      functional: true,
      match: {
        regex: /^(?:https?:\/\/(?:www\.)?)?youtube\.com\/watch[?]v=.+/
      },
      description: 'Capture the YouTube video and all comments.',
      updated: '2019-08-21T14:52:23-07:00',
      fileName: 'youtubeVideoBehavior.js'
    },
    {
      name: 'facebookNewsFeed',
      displayName: 'Facebook Timeline',
      match: {
        regex: /^https?:\/\/(www\.)?facebook\.com(\/)?([?]sk=nf)?$/
      },
      description: 'Capture all items and comments in the Facebook timeline and scroll down to load more.',
      updated: '2019-08-21T14:52:23-07:00',
      fileName: 'facebookNewsFeedBehavior.js'
    },
    {
      name: 'facebookUserFeed',
      displayName: 'Facebook Page',
      match: {
        regex: /^https?:\/\/(www\.)?facebook\.com\/[^/]+\/?$/
      },
      description: 'Capture all items and comments in the Facebook page and scroll down to load more content where possible.',
      updated: '2019-08-21T14:52:23-07:00',
      fileName: 'facebookUserFeedBehavior.js'
    },
    {
      name: 'fulcrumEpubBehavior',
      displayName: 'Fulcrum Epub',
      functional: true,
      match: {
        regex: /https?:\/\/(www\.)?fulcrum\.org\/epubs\/.+/
      },
      description: 'Views the content of an Epub',
      updated: '2019-09-23T17:19:38-04:00',
      fileName: 'fulcrumEpubsBehavior.js'
    },
    {
      name: 'gofundmeCampaignBehavior',
      displayName: 'GoFundMe Campaign',
      functional: true,
      match: {
        regex: /^https?:\/\/(www\.)?gofundme\.com\/f\/[^/]+(?:\/)?$/
      },
      description: 'Capture and expand all updates, comments, and donations.',
      fileName: 'gofundmeCampaignBehavior.js'
    },
    {
      name: 'instagramOwnFeedBehavior',
      displayName: 'Instagram User Feed',
      functional: true,
      match: {
        regex: /^https?:\/\/(www\.)?instagram\.com(?:\/)?$/
      },
      description: 'Capture all stories, images, videos and comments on the logged in users feed.',
      updated: '2019-10-11T17:08:12-04:00',
      fileName: 'instagramOwnFeedBehavior.js'
    },
    {
      name: 'instagramPostBehavior',
      displayName: 'Instagram Post',
      functional: true,
      match: {
        regex: /^https?:\/\/(www\.)?instagram\.com\/p\/[^/]+(?:\/)?$/
      },
      description: 'Capture every image and/or video, retrieve all comments, and scroll down to load more.',
      updated: '2019-10-11T17:08:12-04:00',
      fileName: 'instagramPostBehavior.js'
    },
    {
      name: 'instagramUserBehavior',
      displayName: 'Instagram User Page',
      functional: true,
      match: {
        regex: /^https?:\/\/(www\.)?instagram\.com\/[^/]+(?:\/(?:[?].+)?(?:tagged(?:\/)?)?)?$/
      },
      description: 'Capture all stories, images, videos and comments on user’s page.',
      updated: '2019-10-11T17:08:12-04:00',
      fileName: 'instagramUserBehavior.js'
    },
    {
      name: 'soundCloudArtistBehavior',
      displayName: 'Soundcloud Profile',
      functional: true,
      match: {
        regex: /^(?:https?:\/\/(?:www\.)?)?soundcloud\.com\/(?!(?:discover|stream))[^/]+(?:\/(?:tracks|albums|sets|reposts))?(?:\/)?$/
      },
      description: 'Capture every track on Soundcloud profile.',
      updated: '2019-08-21T14:52:23-07:00',
      fileName: 'soundcloudArtistBehavior.js'
    },
    {
      name: 'soundCloudEmbedBehavior',
      displayName: 'Soundcloud Embed',
      functional: true,
      match: {
        regex: /^https?:\/\/w\.soundcloud\.com\/player\/.+/
      },
      description: 'Capture every track in the Soundcloud embed.',
      updated: '2019-08-21T14:52:23-07:00',
      fileName: 'soundcloudEmbedBehavior.js'
    },
    {
      name: 'twitterTimelineBehavior',
      displayName: 'Twitter Timeline',
      functional: true,
      match: {
        regex: /^(?:https?:[/]{2}(?:www[.])?)?twitter[.]com[/]?.*/
      },
      description: 'Capture every tweet, including quotes, embedded videos, images, replies and/or related tweets in thread.',
      updated: '2020-04-27T00:00:00Z',
      fileName: 'twitterTwitterAllBehavior.js'
    },
    {
      name: 'yahooGroupConvoMessagesBehavior',
      displayName: 'Yahoo Group Conversation Messages',
      functional: true,
      match: {
        regex: /^https?:\/\/(?:www\.)?groups\.yahoo\.com\/neo\/groups\/[^/]+\/conversations\/messages(?:[?].+)?$/
      },
      description: 'Views conversation messages of a Yahoo Group',
      updated: '2019-10-23T15:04:10-04:00',
      fileName: 'yahooGroupsConversationMessagesBehavior.js'
    }
  ]
};