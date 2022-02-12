import React, { Component } from 'react';
import PropTypes from 'prop-types';

class MapsContactCustomField extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    wikiData: PropTypes.string,
  }

  render() {
    const { data, wikiData } = this.props;
    return (
      <>
        <div>
          <strong className="tabHeader">Contact</strong>
          <br />
          <br />
          {data.address ? (
            <p>
              <strong>Address: </strong>
              {data.address}
            </p>
          ) : null}
          {data.phone ? (
            <p>
              <strong>Phone: </strong>
              <a href={`tel:${data.phone}`}>
                {data.phone}
              </a>
            </p>
          ) : null}
          {data.website ? (
            <p>
              <strong>Website: </strong>
              <a href={data.website} target="_blank" rel="noopener noreferrer">
                {data.website}
              </a>
            </p>
          ) : null}
          <br />
        </div>
        <div>
          <strong className="tabHeader">About</strong>
          <br />
          <br />
          {wikiData}
          <br />
          <a href={`https://en.wikipedia.org/wiki/${data.name}`} target="_blank" rel="noreferrer">
            {`https://en.wikipedia.org/wiki/${data.name}`}
          </a>
        </div>
      </>
    );
  }
}

export default MapsContactCustomField;
