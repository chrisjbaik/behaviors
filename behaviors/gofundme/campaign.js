import * as lib from '../../lib';

const RATE_LIMIT_DELAY = 1000;
const PAGE_SCROLL_INCREMENT = 300;
const PAGE_SCROLL_DELAY = 100;

const updatesShowOlderSelector =
  '#root > div > main > div > div.p-campaign-content > div.p-campaign-updates > div > button';

const commentsShowMoreSelector =
  '#root > div > main > div > div.p-campaign-content > div.p-campaign-comments > div > button';

const donationsButtonSelector =
  '#root > div > main > div > div.p-campaign-sidebar > aside > div.show-for-large > div > div > a.mt.a-button.a-button--inline.a-button--small.a-button--hollow-green.a-link';

const donationModalContent = '.o-modal-donations-content';
const donationsSelector = '.o-donation-list-item';

const commentsSelector = 'li.o-comments-list-item';

function getCampaignId() {
  const regex = /\/f\/([^\/]*)/;
  const match = window.location.pathname.match(regex);
  if (match) {
    return match[1];
  } else {
    return '';
  }
}

// means to perform the series of actions
export default async function* gofundmeCampaignBehavior(cliAPI) {
  await lib.domCompletePromise();

  const state = {
    timesScrolled: 0,
    commentsLoaded: 0,
    updateBatchesLoaded: 0,
    donationsLoaded: 0,
  };

  // 1. Slowly scroll to the bottom of the page
  const scroller = lib.createScroller();
  scroller.scrollUpDownAmount = PAGE_SCROLL_INCREMENT;
  while (scroller.canScrollDownMore()) {
    scroller.scrollDown();
    state.timesScrolled++;
    await lib.delay(PAGE_SCROLL_DELAY);
    yield lib.stateWithMsgWait('Autoscroll waiting for network idle', state);
  }

  yield lib.stateWithMsgWait('Waiting for updates to load...', state);

  // 2. Click "Show Older" for all updates until it disappears
  let showOlderButton = lib.qs(updatesShowOlderSelector);
  while (showOlderButton) {
    await lib.clickWithDelay(showOlderButton, RATE_LIMIT_DELAY);
    state.updateBatchesLoaded += 1;
    yield lib.stateWithMsgWait('Waiting for more updates to load...', state);
    showOlderButton = lib.qs(updatesShowOlderSelector);
  }

  // 3. Click "Show More" for all comments until no more load
  let showMoreButton = lib.qs(commentsShowMoreSelector);
  let moreToExtract = true;
  let lastCommentCount = 0;
  while (moreToExtract) {
    await lib.clickWithDelay(showMoreButton, RATE_LIMIT_DELAY);
    yield lib.stateWithMsgWait('Waiting for more comments to load...', state);

    const commentNodes = lib.qsa(commentsSelector);
    if (commentNodes) {
      state.commentsLoaded = commentNodes.length;
    }

    if (!commentNodes || commentNodes.length === lastCommentCount) {
      moreToExtract = false;
    }
    lastCommentCount = commentNodes.length;
  }

  // 4. Load all donations
  let donationsButton = lib.qs(donationsButtonSelector);
  if (donationsButton) {
    await lib.clickWithDelay(donationsButton, RATE_LIMIT_DELAY);
    yield lib.stateWithMsgWait('Loading donations...', state);

    const donationsModal = lib.qs(donationModalContent);
    let donations = lib.qsa(donationsSelector);

    let lastDonationCount = (donations && donations.length) || 0;
    let moreDonations = true;
    while (moreDonations) {
      donationsModal.scroll(0, donationsModal.scrollHeight);
      await lib.delay(RATE_LIMIT_DELAY);
      yield lib.stateWithMsgWait(
        'Waiting for more donations to load...',
        state
      );

      donations = lib.qsa(donationsSelector);
      if (donations) {
        state.donationsLoaded = donations.length;
      }

      if (!donations || donations.length === lastDonationCount) {
        moreDonations = false;
      }
      lastDonationCount = donations.length;
    }
  }

  return lib.stateWithMsgNoWait(
    `Finished viewing Campaign <${getCampaignId()}>`,
    state
  );
}

// information about the behavior
export const metadata = {
  name: 'gofundmeCampaignBehavior',
  displayName: 'GoFundMe Campaign',
  functional: true,
  match: {
    regex: /^https?:\/\/(www\.)?gofundme\.com\/f\/[^/]+(?:\/)?$/,
  },
  description: 'Capture and expand all updates, comments, and donations.',
};

// flag indicating this file is a behavior ready to be used
export const isBehavior = true;

// optional function to be called after each step of the behavior
// export function postStep(rawBehaviorStepResults) { }
