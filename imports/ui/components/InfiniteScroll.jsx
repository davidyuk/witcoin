import React from 'react';

export default class InfiniteScroll extends React.Component {
  componentWillMount() {
    this._requestedCount = 5;
    this.countCallback = this.countCallback.bind(this);
    this.onScroll = this.onScroll.bind(this);
  }

  componentWillReceiveProps() {
    this._requestedCount = 5;
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  }

  onScroll() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop + document.body.clientHeight > document.body.scrollHeight - 250)
      this.loadMore();
  }

  countCallback(count) {
    this._loadedCount = count;
    if (document.body.clientHeight >= document.body.scrollHeight)
      this.loadMore();
  }

  loadMore() {
    if (this._loadedCount < this._requestedCount) return;
    this._requestedCount = this._requestedCount + 5;
    this.forceUpdate();
  }

  render() {
    return React.cloneElement(this.props.children, {
      limit: this._requestedCount,
      countCallback: this.countCallback,
      showProgressBarPermanently: true,
    });
  }
}
