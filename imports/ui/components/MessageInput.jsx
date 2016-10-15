import React from 'react';

const MessageInput = ({handler, placeholder, buttonText}) => {
  const onSubmit = event => {
    event.preventDefault();
    if (!event.target.content.value) return;
    handler(event.target.content.value);
    event.target.content.value = '';
  };

  const onKeyDown = event => {
    if (event.keyCode == 13 && !event.shiftKey) {
      event.preventDefault();
      event.target.form.submit.click();
    }
  };

  const style = {minHeight: 50 + 'px', margin: '5px 0'};

  return (
    <form onKeyDown={onKeyDown} onSubmit={onSubmit} style={{flexShrink: 0}}>
      <textarea className="form-control input-sm" name="content" {...{placeholder, style}} />
      <input type="submit" className="btn btn-primary btn-sm" name="submit" value={buttonText || 'Отправить'} />
    </form>
  );
};

MessageInput.propTypes = {
  handler: React.PropTypes.func.isRequired,
  placeholder: React.PropTypes.string,
  buttonText: React.PropTypes.string,
};

export default MessageInput;
