import React from 'react';

export default class InstanceEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      edited: false,
      fields: props.instance ? this.getFieldsByInstance(props.instance) : this.getDefaultFields(),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.edited) {
      this.setState({fields: nextProps.instance
        ? this.getFieldsByInstance(nextProps.instance)
        : this.getDefaultFields()});
    }
  }

  getDefaultFields() { return {}; }

  getFieldsByInstance(instance) { return {}; }

  submitFields(fields) {}

  isDisabled() { return false; }

  renderFields() { return null; }

  submit(event) {
    event.preventDefault();
    if (!this.props.instance || this.state.edited) {
      this.setState({edited: false});
      this.submitFields(this.state.fields);
      if (!this.props.instance) {
        this.setState({fields: this.getDefaultFields()});
      }
    }
  }

  setFieldValue(fieldName, fieldValue) {
    this.setState({fields: {...this.state.fields, [fieldName]: fieldValue}, edited: true});
  }

  reset() {
    this.setState({
      fields: this.getFieldsByInstance(this.props.instance),
      edited: false,
    });
  }

  render() {
    const {edited} = this.state;
    const {instance} = this.props;

    return (
      <form onSubmit={this.submit.bind(this)}>
        {this.renderFields()}

        <input type="submit" className="btn btn-primary btn-sm" disabled={this.isDisabled()} value="Сохранить" />
        {instance && edited ? <span>
          &nbsp;
          <button className="btn btn-default btn-sm" onClick={() => this.reset()}>Отменить изменения</button>
        </span> : null}
      </form>
    );
  }
};

InstanceEditor.propTypes = {
  instance: React.PropTypes.object,
};
