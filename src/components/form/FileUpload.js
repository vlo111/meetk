import React from 'react';
import Dropzone from 'react-dropzone';
import _ from 'lodash';
import Utils from '../../helpers/Utils';

const MAX_SIZE = 3145728;

class FileUpload extends React.Component {
    state = { warningMsg: '' };

    onDrop = (accepted, rejected) => {
      if (Object.keys(rejected).length !== 0) {
        let message = '';
        if (rejected[0].size > MAX_SIZE) {
          message = 'Failed to upload a file. The file maximum size is 3MB.';
        } else message = 'Please submit valid file type';
        this.setState({ warningMsg: message });
      } else if (accepted[0].type.includes('gif')) {
        this.setState({ warningMsg: 'Please submit valid file type' });
      } else {
        this.setState({ warningMsg: '' });
        // const blobPromise = new Promise((resolve, reject) => {
        //   const reader = new window.FileReader();
        //   reader.readAsDataURL(accepted[0]);
        //   reader.onloadend = () => {
        //     const base64data = reader.result;
        //     resolve(base64data);
        //   };
        // });
        // blobPromise.then((value) => {
        //   accepted[0].preview = value;
        //
        // });
        this.props.addFile(accepted);
      }
    };

    render() {
      const { file } = this.props;

      let thumbs = {};

      let render = (
        <p>
          Drag&Drop file here
          <br />
          or
          <br />
          Browse file
        </p>
      );

      if (file.length) {
        const isImg = !_.isEmpty(['png', 'jpg', 'jpeg', 'gif', 'svg'].filter((p) => file[0].type.includes(p)));

        if (isImg) {
          const thumbsContainer = {
            width: '150px',
            height: '150px',
            borderRadius: '10px',
            objectFit: 'cover',
            objectPosition: 'center',
          };

          thumbs = file.map((file) => (
            <img style={thumbsContainer} src={file.preview} alt="profile" />
          ));
          render = file.map((file) => <aside>{thumbs}</aside>);
        } else {
          render = file.map((file) => (
            <p
              className="fileText"
              title={file.name}
              key={file.name}
            >
              {Utils.substr(file.name, 10)}
            </p>
          ));
        }
      }

      return (
        <div>
          {this.state.warningMsg && <p className="validateTabFile">{this.state.warningMsg}</p>}
          <div className="dropzone">
            <Dropzone
              multiple={false}
              maxSize={MAX_SIZE}
                        // accept="image/*"
              onDrop={(accepted, rejected) => this.onDrop(accepted, rejected)}
            >
              {({
                isDragAccept, isDragReject, acceptedFiles, rejectedFiles,
              }) => {
                // for drag and drop warning statement
                if (isDragReject) return 'Please submit a valid file';
                return render;
              }}
            </Dropzone>
          </div>
        </div>
      );
    }
}

export default FileUpload;
