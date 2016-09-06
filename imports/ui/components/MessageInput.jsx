import React from 'react';

export default class MessageInput extends React.Component {
  onSubmit(event) {
    event.preventDefault();
    if (!event.target.content.value) return;
    this.props.handler(event.target.content.value);
    event.target.content.value = '';
  }

  onKeyDown(event) {
    if (event.keyCode == 13 && !event.shiftKey) {
      event.preventDefault();
      event.target.form.submit.click();
    }
  }

  render() {
    return (
      <form onKeyDown={this.onKeyDown} onSubmit={this.onSubmit.bind(this)} style={{padding: '5px 0', flexShrink: 0}}>
        <div className="form-group" style={{marginBottom: 5 + 'px'}}>
          <textarea className="form-control input-sm" name="content" placeholder={this.props.placeholder}
                    style={{minHeight: 50 + 'px'}}/>
        </div>
        <input type="submit" className="btn btn-primary btn-sm" name="submit" value="Отправить"/>
      </form>
    );
  }
}

MessageInput.propTypes = {
  handler: React.PropTypes.func,
  placeholder: React.PropTypes.string,
};
