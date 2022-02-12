import React, { Component } from 'react';

import { Editor } from '@tinymce/tinymce-react';
import PropTypes from 'prop-types';

class Tinymce extends Component {
    static propTypes = {
      onEditorChange: PropTypes.func.isRequired,
    }

    render() {
      return (
        <Editor

          apiKey="h6lyvx3bndhcw62rqa63obzwweuyih4tx4joo191wl729ntp"
          value={value}
          init={{
            resize: true,
            menubar: false,
            toolbar_location: 'bottom',
            statusbar: false,

            image_title: true,
            plugins: ' print preview fullpage searchreplace  \
                        autolink directionality visualblocks visualchars fullscreen image \
                        link media template codesample table charmap hr pagebreak nonbreaking  \
                        anchor toc insertdatetime advlist lists textcolor wordcount imagetools \
                        contextmenu colorpicker textpattern help code emoticons ',
            toolbar: 'formatselect | bold italic forecolor | image | media link tinydrive imagetools \
                    | emoticons  \
                        backcolor | alignleft aligncenter alignright alignjustify  \
                        removeformat insertfile ',
            automatic_uploads: true,
            file_picker_types: 'image',
            paste_data_images: true,
            tinydrive_token_provider: 'URL_TO_YOUR_TOKEN_PROVIDER',
            tinydrive_dropbox_app_key: 'YOUR_DROPBOX_APP_KEY',
            tinydrive_google_drive_key: 'YOUR_GOOGLE_DRIVE_KEY',
            tinydrive_google_drive_client_id: 'YOUR_GOOGLE_DRIVE_CLIENT_ID',
            image_advtab: true,

            file_browser_callback_types: 'image',
            file_picker_callback(cb, value, meta) {
              const input = document.createElement('input');
              input.setAttribute('type', 'file');
              input.setAttribute('accept', 'image/*');
              input.onchange = function () {
                const file = this.files[0];

                const reader = new FileReader();
                reader.onload = function () {
                  const id = `blobid${(new Date()).getTime()}`;
                  // eslint-disable-next-line no-undef
                  const { blobCache } = tinymce.activeEditor.editorUpload;
                  const base64 = reader.result.split(',')[1];
                  const blobInfo = blobCache.create(id, file, base64);
                  cb(blobInfo.blobUri(), { title: file.name });
                };
                reader.readAsDataURL(file);
              };

              input.click();
            },
            paste_data_images: true,

          }}
        />
      );
    }
}
export default Tinymce;
