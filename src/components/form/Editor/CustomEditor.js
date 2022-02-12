import React, { Component } from 'react';
import _ from 'lodash';
import { Jodit } from 'jodit';
import 'jodit/build/jodit.min.css';
import PropTypes from 'prop-types';
import Utils from '../../../helpers/Utils';
import Outside from '../../Outside';
import MediaModal from './MediaModal';
// import Picker from 'emoji-picker-react';
// import { MentionsInput, Mention } from 'react-mentions'

class CustomEditor extends Component {
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
    height: 200,
    toolbarButtonSize: 'middle',
    buttons: [
      'bold', 'italic', 'underline', 'fontsize', 'font', '|', 'file', 'video', '|',
      'align', 'undo', 'redo', 'brush', '|',
      'eraser', '|',

    ],
  }

  constructor(props) {
    super(props);
    this.state = {
      showPopUp: null,
      popUpData: {},
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
    options.controls.file = {
      popup: (jodit, anchor) => {
        const popUpData = {};
        const selected = window.getSelection().toString().trim();

        if (anchor && anchor.getAttribute) {
          popUpData.file = anchor.getAttribute('href');
          popUpData.fileName = anchor.getAttribute('download');
          popUpData.text = anchor.innerText;
          popUpData.update = anchor.outerHTML;
        } else if (selected) {
          popUpData.update = selected;
          popUpData.text = selected;
        }

        this.setState({ showPopUp: 'file', popUpData });
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
    this.setState({ showPopUp: null, popUpData: {} });
  }

  insertFile = (popUpData) => {
    const file = popUpData.file[0];

    const { tags } = popUpData;

    if (file) {
      const isImg = !_.isEmpty(['png', 'jpg', 'jpeg', 'gif', 'svg', 'jfif']
        .filter((p) => file.name.toLocaleLowerCase().includes(p)));

      const desc = popUpData.desc ? `${popUpData.desc}` : '';

      let anchor = '';

      if (isImg) {
        anchor = `<img
          class=preview-scaled
          src=${file.preview}
          download="${file.name}"/>`;
      } else {
        anchor = `<a 
href="${file.preview}"
download="${file.name}">
${popUpData.alt || file.name}
</a>`;
      }

      let html;
      if (popUpData.update) {
        html = this.editor.value.replace(popUpData.update, anchor);
      } else {
        html = this.editor.value + anchor;
      }
      this.editor.value = html;
    }

    this.setState({ showPopUp: null });
  }

  handlePopUpDataChange = (path, value) => {
    const { popUpData } = this.state;
    _.set(popUpData, path, value);
    this.setState({ popUpData });
  }

  render() {
    const { showPopUp, popUpData } = this.state;
    const { className, error, label } = this.props;
    let top;
    let left;
    if (showPopUp) {
      const pos = document.querySelector(`.jodit-toolbar-button_${showPopUp}`).getBoundingClientRect();
      top = pos.top + 35;
      left = pos.left;
    }

    return (
      <div className={`comments ${className} ${error ? 'hasError' : ''}`}>
        {label ? <span className="label">{label}</span> : null}
        <textarea ref={(ref) => this.textarea = ref} />
        {error ? <span className="error">{error}</span> : null}
        {showPopUp === 'file' ? (
          <MediaModal close={this.closePopUp} insertFile={this.insertFile} />
        ) : null}
      </div>
    );
  }
}

export default CustomEditor;
