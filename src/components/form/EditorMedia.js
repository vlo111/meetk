import React, { Component } from 'react';
import PropTypes from 'prop-types';

class EditorMedia extends Component {
  static propTypes = {
    file: PropTypes.object.isRequired,
    fileData: PropTypes.object.isRequired,
  }

  render() {
    const { file, fileData } = this.props;

    const displayStyle = { display: 'none' };

    const data = (
      <div>
        <span id="docId" style={displayStyle}>{file.id}</span>
        <p style={displayStyle} className="tags">{fileData.tags.toString()}</p>
      </div>
    );

    if (!file.type.startsWith('image/')) {
      return (
        <div className="document">
          {data}
          <p style={displayStyle} className="description">{fileData.description}</p>

          <div className="documentContainer">
            <a className="documentLink" target="_blank" href={file.preview} download={file.name} contentEditable="false" rel="noreferrer">
              {file.name}
            </a>
          </div>
        </div>
      );
    }

    if (!fileData.description) {
      return (
        <div className="document">
          {data}
          <img width="200" className="scaled" src={file.preview} alt={fileData.alt || file.name} />
        </div>
      );
    }

    return (
      <table className="document" style={{ width: 200 }}>
        <tbody>
          <tr>
            <td>
              {data}
              <img width="200" className="scaled" src={file.preview} alt={fileData.alt || file.name} />
              <p className="description">{fileData.description}</p>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  handleKeyDown(event) {
    this.props.onKeyDown(event);
  }
}

export default EditorMedia;
