import React from 'react';

import Action from './Action';

export default class ActionList extends React.Component {
  componentDidMount() {
    this.onScroll = this.onScroll.bind(this);
    window.addEventListener('scroll', this.onScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  }

  onScroll() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop + document.body.clientHeight > document.body.scrollHeight - 250)
      this.props.loadMore();
  }

  componentDidUpdate() {
    if (document.body.clientHeight >= document.body.scrollHeight)
      this.props.loadMore();
  }

  render() {
    const actions = this.props.actions;

    return (
      <div>
        <div className="list-group">
          {actions && actions.length ? actions.map(item =>
            <Action action={item} key={item._id} />
          ) : <i>Нет записей</i>}
        </div>
        <div className="progress" style={{display: this.props.actionsLoading ? 'block' : 'none'}}>
          <div className="progress-bar progress-bar-striped active" style={{width: '100%'}} />
        </div>
      </div>
    );
  }
}

ActionList.propTypes = {
  actions: React.PropTypes.array,
  actionsCount: React.PropTypes.number,
  actionsLoading: React.PropTypes.bool.isRequired,
  loadMore: React.PropTypes.func.isRequired,
};
