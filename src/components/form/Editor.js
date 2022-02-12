import React, { Component } from 'react';
import { Jodit } from 'jodit';
import 'jodit/build/jodit.min.css';
import PropTypes from 'prop-types';
import ReactDOMServer from 'react-dom/server';
import EditorMedia from './EditorMedia';
import InsertMediaModal from '../tabs/modal/InsertMediaModal';

class Editor extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    ref: PropTypes.func,
    value: PropTypes.string.isRequired,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    error: PropTypes.string,
    buttons: PropTypes.array,
  }

  static defaultProps = {
    className: '',
    ref: null,
    label: '',
    placeholder: '',
    error: '',
    height: 400,
    toolbarButtonSize: 'middle',
    buttons: [
      'bold', 'italic', 'underline', 'fontsize', 'font', '|', 'file', 'video', '|',

      'ul', 'ol', '|',
      'outdent', 'indent', '|',
      'brush',
      'paragraph', 'table', '|',
      'align', 'undo', 'redo', '|',
      'hr',
      'eraser',
      'copyformat', '|',
      'symbol',
      'fullsize',
      'link',
    ],
  }

  constructor(props) {
    super(props);
    this.state = {
      showPopUp: null,
    };
  }

  componentDidMount() {
    const {
      value, ref, className, onChange, label, error, buttons, ...options
    } = this.props;
    if (this.editor) {
      this.editor.destruct();
    }
    options.iframe = true;

    options.buttons = buttons;

    options.buttonsMD = options.buttonsMD || buttons;

    options.buttonsSM = options.buttonsSM || buttons;

    options.buttonsXS = options.buttonsXS || buttons;

    options.controls = options.controls || {};

    options.minHeight = 400;

    options.controls.file = {
      popup: (jodit, anchor) => {
        const popUpData = {};
        const selected = window.getSelection().toString().trim();

        if (anchor && anchor.getAttribute) {
          popUpData.file = anchor.getAttribute('href');
          popUpData.fileName = anchor.getAttribute('download');
          popUpData.alt = anchor.innerText;
          popUpData.update = anchor.outerHTML;
        } else if (selected) {
          popUpData.update = selected;
          popUpData.alt = selected;
        }

        this.setState({ showPopUp: 'file' });
      },
    };

    this.editor = new Jodit(this.textarea, options);

    if (ref) {
      ref(this.editor);
    }

    this.editor.events.on('change', onChange);

    this.editor.value = value;
  }

  componentDidUpdate() {
    const { value } = this.props;
    if (value !== this.editor.value) {
      this.editor.value = value;
    }
  }

  componentWillUnmount() {
    if (this.editor) {
      this.editor.destruct();
    }
  }

  closePopUp = () => {
    this.setState({ showPopUp: null });
  }

  insertFile = async (file, fileData) => {
    if (!file) {
      return;
    }
    const mediaHtml = ReactDOMServer.renderToString(<EditorMedia file={file} fileData={fileData} />);

    let html;
    if (fileData.update) {
      html = this.editor.value.replace(fileData.update, mediaHtml);
    } else {
      html = this.editor.value + mediaHtml;
    }
    this.editor.value = html;

    if (this.props.insertFile) {
      this.props.insertFile(file);
    }
    this.setState({ showPopUp: null });
  }

  render() {
    const { showPopUp } = this.state;
    const { className, error, label } = this.props;
    return (
      <div className={`contentEditor ${className} ${error ? 'hasError' : ''}`}>
        {label ? <span className="label">{label}</span> : null}
        <textarea ref={(ref) => this.textarea = ref} />
        {error ? <span className="error">{error}</span> : null}
        {showPopUp === 'file' ? (
          <InsertMediaModal close={this.closePopUp} insertFile={this.insertFile} />
        ) : null}
      </div>
    );
  }
}

export default Editor;
