import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as Premis } from '../../assets/images/premission.svg';
import { ReactComponent as BackSvg } from '../../assets/images/icons/back.svg';
import Button from '../../components/form/Button';

class Page403 extends Component {
  render() {
    return (
      <div className="errorPages">
        <div className="permission">
          <Link to="/" className="backErrorPages">
            <Button icon={<BackSvg style={{ height: 30 }} />} className="transparent edit" />
            Back
          </Link>
          <Premis className="peremissiomSvg" />
        </div>
      </div>
    );
  }
}

export default Page403;
