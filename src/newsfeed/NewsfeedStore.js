import { observable, action } from 'mobx'

import { getFeed, getBoosts } from './NewsfeedService';

import OffsetFeedListStore from '../common/stores/OffsetFeedListStore';
/**
 * News feed store
 */
class NewsfeedStore {

  @observable list = new OffsetFeedListStore();

  @observable.ref boosts = [];

  /**
   * List loading
   */
  loading = false;

  /**
   * Load feed
   */
  loadFeed() {

    if (this.list.cantLoadMore() || this.loading) {
      return Promise.resolve();
    }
    this.loading = true;

    return getFeed(this.list.offset)
      .then(
        feed => {
          this.list.setList(feed);
          this.loaded = true;
        }
      )
      .finally(() => {
        this.loading = false;
      })
      .catch(err => {
        console.log('error', err);
      });
  }

  /**
   * Load boosts
   */
  loadBoosts() {
    // get 15 boosts
    getBoosts(15)
      .then(boosts => {
        this.boosts = boosts;
      })
  }

  @action
  clearFeed() {
    this.list.clearList();
  }

  @action
  clearBoosts() {
    this.boosts = [];
  }

  @action
  refresh() {
    this.list.refresh();
    this.loadFeed()
      .finally(() => {
        this.list.refreshDone();
      });
  }

}

export default new NewsfeedStore();