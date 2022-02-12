export default {
  image: {
    width: 0,
    url: 'http://i.imgur.com/hSqdOZI.jpg',
    height: 0,
    x: 0,
    y: 50,
    rotate: {
      angle: 0, cx: 0, cy: 0,
    },
    translate: {
      x: 0, y: 0,
    },
    transform: {
      rotate: null, translate: null,
    },
  },
  updateImageTranslateCoordinates(x, y) {
    this.image.translate.x = x || this.image.translate.x;
    this.image.translate.y = y || this.image.translate.y;
  },
  getImageUpdatedTranslateCoordinates() { return this.image.translate; },
  /**
   * Function to get the current image rotate coordinate values
   * */
  getImageUpdatedRotateCoordinates() { return this.image.rotate; },
  /**
  * Function to get the current image coordinate values
  */
  getImageUpdatedCoordinates() {
    return {
      width: this.image.width,
      height: this.image.height,
      x: this.image.x,
      y: this.image.y,
    };
  },
  /**
   * Function to update the rotate values
   * */
  updateImageRotateCoordinates(angle, cx, cy) {
    angle = angle || this.image.rotate.angle;
    cx = cx || this.image.rotate.cx;
    cy = cy || this.image.rotate.cy;

    this.image.rotate.angle = angle;
    this.image.rotate.cx = cx;
    this.image.rotate.cy = cy;
  },
  /**
   * Function to update the transform string value
   * for the passed transform attr
   * */
  updateImageTransform(transform, stringValue) {
    this.image.transform[transform] = stringValue;
  },
  /**
   * Function to update the image position and dimension
   * coordinate values
   * */
  updateImageCoordinates(width, height, x, y) {
    width = width || this.image.width;
    height = height || this.image.height;
    x = x || this.image.x;
    y = y || this.image.y;

    this.image.width = width;
    this.image.height = height;
    this.image.x = x;
    this.image.y = y;
  },

  getTransform() {
    let transform = '';
    if (this.image.transform.rotate) {
      transform = this.image.transform.rotate;
    }
    if (this.image.transform.translate) {
      transform += this.image.transform.translate;
    }
    return transform;
  },
};
