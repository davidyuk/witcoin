import React from 'react';

const FormCheckbox = ({children, checked, disabled, onChange}) =>
  <div className="checkbox" style={{margin: '5px 0'}}>
    <label>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} />{children}
    </label>
  </div>;

FormCheckbox.propTypes = {
  checked: React.PropTypes.bool,
  disabled: React.PropTypes.bool,
  onChange: React.PropTypes.func.isRequired,
};

FormCheckbox.defaultProps = {
  checked: false,
  disabled: false,
};

export default FormCheckbox;
