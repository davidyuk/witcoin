import React from 'react';

import Action from './Action';

export default class ActionList extends React.Component {
  render() {
    const actions = this.props.actions;

    return (
      <div>
        <div className="list-group">
          {actions && actions.length ? actions.map(item =>
            <Action action={item} key={item._id} />
          ) : <i>Нет записей</i>}
        </div>
      </div>
    );
  }
}

ActionList.propTypes = {
  actions: React.PropTypes.array,
  actionsCount: React.PropTypes.number,
};
