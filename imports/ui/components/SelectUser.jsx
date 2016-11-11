import React from 'react';
import ReactMixin from 'react-mixin';
import { ReactMeteorData } from 'meteor/react-meteor-data';

export default class SelectUser extends React.Component {
  constructor() {
    super();
    this.state = {query: '', resultVisible: false, userId: ''};
    this.data = {users: []};
    this.handleFocus = this.handleFocus.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  updateValidity() {
    this._input.setCustomValidity(this.state.userId || !this.props.required ? '' : 'Пожалуйста, выберите пользователя.');
  }

  componentDidMount() {
    this.updateValidity();
  }

  componentDidUpdate() {
    if (this.state.resultVisible) window.addEventListener('click', this.handleClick);
    else window.removeEventListener('click', this.handleClick);
    this.updateValidity();
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props.selectHandler && this.state.userId != nextState.userId)
      this.props.selectHandler(nextState.userId);
  }

  getMeteorData() {
    return {
      users: Meteor.users.index.search(this.state.query).fetch(),
    }
  }

  handleFocus(event) {
    event.target.select();
    this.setState({resultVisible: true});
  }

  handleClick(event) {
    if (!this._root.contains(event.target))
      this.setState({resultVisible: false});
  }

  handleSelect(userId, userName) {
    const nextState = {resultVisible: false, userId};
    if (this.props.updateInput) nextState.query = userName;
    this.setState(nextState);
  }

  render() {
    const inputProps = {
      placeholder: this.props.placeholder,
      className: this.props.className,
      style: this.props.style,
      value: this.state.query,
    };

    return (
      <div ref={c => this._root = c} style={{position: 'relative'}}>
        {this.props.name ? <input type="hidden" value={this.state.userId} name={this.props.name} /> : null}

        <input ref={c => this._input = c} onChange={event => this.setState({query: event.target.value, userId: ''})}
               onFocus={this.handleFocus} type="search" {...inputProps} />
        <span className={'glyphicon glyphicon-search form-control-feedback '
        + (this.props.required && this.state.query ? this.state.userId ? 'text-success' : 'text-danger' : '')} />

        {this.state.resultVisible ? (
          <div className="list-group" style={{zIndex: 10, position: 'absolute', width: '100%'}}>
            {this.data.users
              .map(user =>
                <button type="button" key={user._id} className="list-group-item"
                        onClick={() => this.handleSelect(user.__originalId, user.getFullName())}>
                  {user.getFullName()}
                </button>
              )
            }
          </div>
        ) : null}
      </div>
    );
  }
}

SelectUser.propTypes = {
  className: React.PropTypes.string,
  style: React.PropTypes.object,
  selectHandler: React.PropTypes.func,
  updateInput: React.PropTypes.bool,
  placeholder: React.PropTypes.string,
  name: React.PropTypes.string,
  required: React.PropTypes.bool,
};

SelectUser.defaultProps = {
  className: '',
  style: {},
  updateInput: true,
  placeholder: 'Имя пользователя',
  required: false,
};

ReactMixin(SelectUser.prototype, ReactMeteorData);
