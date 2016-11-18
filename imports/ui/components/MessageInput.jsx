import React from 'react';

const MessageInput = ({handler, placeholder, buttonText, defaultValue, required}) => {
  const onSubmit = event => {
    event.preventDefault();
    if (required && !event.target.content.value) return;
    handler(event.target.content.value);
    event.target.content.value = '';
  };

  const onKeyDown = event => {
    if (event.keyCode == 13 && !event.shiftKey) {
      event.preventDefault();
      event.target.form.submit.click();
    }
  };

  const setHeight = node => {
    if (node && defaultValue)
      node.style.height = node.scrollHeight + 5 + 'px';
  };

  const style = {minHeight: 50 + 'px', margin: '5px 0'};

  return (
    <form onKeyDown={onKeyDown} onSubmit={onSubmit} style={{flexShrink: 0}}>
      <textarea name="content" ref={setHeight} {...{placeholder, style, defaultValue}}
                className="form-control input-sm" />
      <input type="submit" className="btn btn-primary btn-sm" name="submit" value={buttonText || 'Отправить'} />
    </form>
  );
};

MessageInput.propTypes = {
  handler: React.PropTypes.func.isRequired,
  placeholder: React.PropTypes.string,
  buttonText: React.PropTypes.string,
  defaultValue: React.PropTypes.string,
  required: React.PropTypes.bool,
};

MessageInput.defaultProps = {
  required: true,
};

export default MessageInput;
