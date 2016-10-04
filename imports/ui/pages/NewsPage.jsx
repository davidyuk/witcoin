import React from 'react';

import InfiniteScroll from '../components/InfiniteScroll';
import NewsListContainer from '../containers/NewsListContainer';

export default class NewsPage extends React.Component {
  render() {
    return (
      <InfiniteScroll>
        <NewsListContainer />
      </InfiniteScroll>
    );
  }
}
