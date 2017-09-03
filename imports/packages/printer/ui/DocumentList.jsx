import React from 'react';
import { Link } from 'react-router';
import { FormattedPlural } from 'react-intl';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { Documents } from '../index';
import ProgressBar from '../../../ui/components/ProgressBar';

class DocumentList extends React.Component {
  constructor() {
    super();
    this.state = {
      currentUploads: [],
      dragStart: false,
      windowDragEnter: false,
      dragEnter: false,
      errors: [],
    };
    this.windowDragHandler = this.windowDragHandler.bind(this);
    this._windowDragEnterCount = 0;
  }

  componentDidMount() {
    window.addEventListener('dragenter', this.windowDragHandler);
    window.addEventListener('dragleave', this.windowDragHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('dragenter', this.windowDragHandler);
    window.removeEventListener('dragleave', this.windowDragHandler);
  }

  uploadFiles(files) {
    Array.from(files).forEach(file => {
      const upload = Documents.insert({
        file,
        streams: 'dynamic',
        chunkSize: 'dynamic',
      }, false);

      upload.on('start', () => this.setState(state => ({
        currentUploads: [...state.currentUploads, upload],
      })));

      upload.on('end', (error, fileObj) => {
        console.log(fileObj.name, error);
        this.setState(state => ({
          currentUpload: state.currentUploads.filter(u => u != upload),
          errors: [...state.errors, <span>
            Произошла ошибка при загрузке <b>{fileObj.name}</b> ({error.toString()}).
          </span>],
        }));
      });

      upload.start();
    });
  };

  windowDragHandler(event) {
    console.log('windowDragHandler', event.type, event);
    this._windowDragEnterCount += event.type == 'dragenter' ? 1 : -1;
    this.setState({windowDragEnter: this._windowDragEnterCount > 0});
  }

  dragHandler(event) {
    // event.stopPropagation();
    event.preventDefault();
    console.log('dragHandler', event.type, event);
    this.setState({dragEnter: ['dragenter', 'dragover'].includes(event.type)});
  }

  dropHandler(event) {
    event.stopPropagation();
    event.preventDefault();
    console.log('dropHandler', event, event.dataTransfer.files);
    this.uploadFiles(event.dataTransfer.files);
    this.setState({
      windowDragEnter: false,
      dragEnter: false,
    });
  }

  render() {
    const { currentUploads, windowDragEnter, dragEnter, errors } = this.state;
    const { documents } = this.props;
    const style = {marginBottom: '10px'};
    return <span>
      <h4>Документы</h4>
      <input type="file" multiple ref="fileInput" style={{display: 'none'}}
             onChange={event => this.uploadFiles(event.currentTarget.files)} />
      <button className={'btn btn-default btn-block' + (dragEnter ? ' active' : '')}
              style={{...style, height: windowDragEnter ? '200px' : undefined}}
              onClick={() => this.refs.fileInput.click()}
              onDragEnter={this.dragHandler.bind(this)}
              onDragOver={this.dragHandler.bind(this)}
              onDragLeave={this.dragHandler.bind(this)}
              onDrop={this.dropHandler.bind(this)}>
        {windowDragEnter ? 'Перетащите документ сюда' : 'Добавить документ'}
      </button>
      {errors.map((error, id) => (
        <div className="alert alert-danger" key={id} {...style}>
          <button onClick={() => this.setState({errors: errors.filter(e => e != error)})}
                  type="button" className="close">
            <span>&times;</span>
          </button>
          {error}
        </div>
      ))}
      <table className="table table-noTopBorder">
        <tbody>
        {currentUploads.map(upload => <tr key={console.log(upload)}>
          <td>{upload.file.name}</td>
          <td style={{textAlign: 'right'}}>
            <ProgressBar value={upload.progress.get() / 100} >
              {upload.progress.get()}%,{' '}
              {Math.floor(upload.estimateTime.get() / 1000)}{' '}
              <FormattedPlural value={Math.floor(upload.estimateTime.get() / 1000)}
                               one="секунда" few="секунды" other="секунд"/>
            </ProgressBar>
            <a title="Отменить загрузку" className="text-muted" href="#"
               onClick={event => {event.preventDefault(); upload.abort();}}>
              <span className="glyphicon glyphicon-remove" />
            </a>
          </td>
        </tr>)}
        {documents.map(document => <tr key={document._id}>
          <td>
            <Link to={'/document/' + document._id}>{document.name}</Link>
          </td>
          <td style={{textAlign: 'right'}}>
            <a title="Распечатать документ" className="text-muted" href="#">
              <span className="glyphicon glyphicon-print" />
            </a>&nbsp;
            <a title="Удалить документ" className="text-muted" href="#">
              <span className="glyphicon glyphicon-remove" />
            </a>
          </td>
        </tr>)}
        </tbody>
      </table>
    </span>;
  }
}

DocumentList.propTypes = {
  documents: React.PropTypes.arrayOf(React.PropTypes.object),
};

export default createContainer(() => {
  Meteor.subscribe('printers.documents');

  return {
    documents: Documents.find().fetch(),
  };
}, DocumentList);
