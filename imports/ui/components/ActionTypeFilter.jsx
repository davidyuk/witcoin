import React from 'react';

import { Actions } from '../../api/actions';

export default class ActionTypeFilter extends React.Component {
  componentWillMount() {
    this._types = new Set(this.props.defaultTypes);
  }

  render() {
    const genToggleTypeHandler = types => {
      types = typeof types == 'string' ? [types] : types;
      return event => {
        event.preventDefault();
        event.target.blur();
        const oldSize = this._types.size;
        types.forEach(type => this._types.add(type));
        if (oldSize == this._types.size)
          types.forEach(type => this._types.delete(type));
        this.forceUpdate();
      }
    };

    const isActive = types => {
      types = typeof types == 'string' ? [types] : types;
      return types.reduce((prev, curr) => prev && this._types.has(curr), true);
    };

    const renderButton = (name, types) =>
      <button onClick={genToggleTypeHandler(types)} key={name}
              className={'btn btn-default' + (isActive(types) ? ' active' : '')}>{name}</button>;

    const renderDropDown = (name, child) => {
      const className = 'btn btn-default' + (isActive(Object.values(child)) ? ' active' : '');
      return (
        <div className="btn-group" key={name}>
          <button onClick={genToggleTypeHandler(Object.values(child))} className={className}>{name}</button>
          <button type="button" className={'dropdown-toggle ' + className} data-toggle="dropdown">
            <span className="caret" />
          </button>
          <ul className="dropdown-menu">
            {Object.keys(child).map(name =>
              <li key={name}>
                <a onClick={genToggleTypeHandler(child[name])} href="#">
                  {isActive(child[name]) ? <span className="pull-right glyphicon glyphicon-ok" /> : null}
                  {name}
                </a>
              </li>
            )}
          </ul>
        </div>
      );
    };

    const typesTree = this.props.typesTree;

    return (
      <div>
        <div className="btn-group" style={{marginBottom: '10px'}}>
          {Object.keys(typesTree).map(name =>
            (typeof typesTree[name] == 'string' || typesTree[name] instanceof Array
              ? renderButton : renderDropDown)(name, typesTree[name])
          )}
        </div>
        {React.cloneElement(this.props.children, {
          ...this.props,
          selector: {
            ...this.props.children.props.selector,
            type: {$in: Array.from(this._types.values())},
          },
        })}
      </div>
    );
  }
}

ActionTypeFilter.propTypes = {
  typesTree: React.PropTypes.object,
  defaultTypes: React.PropTypes.array,
};

const T = Actions.types;

ActionTypeFilter.defaultProps = {
  typesTree: {
    'Записи': {
      'Обычные': T.DEFAULT, 'Репосты': T.SHARE,
    },
    'Ответы': {
      'Подписки': T.SUBSCRIBE, 'Оценки': T.RATE, 'Комментарии': T.COMMENT,
    },
    'Выбрать все': Object.values(Actions.types),
  },
  defaultTypes: [T.DEFAULT, T.SHARE],
};
