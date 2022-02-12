import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

class ImportLinkedinCustomField extends Component {
  static propTypes = {
    type: PropTypes.oneOf(['work']).isRequired,
    data: PropTypes.object.isRequired,
  }

  renderWork = () => {
    const { data } = this.props;
    if (_.isEmpty(data.work)) {
      return null;
    }
    return (
      <>
        {data.work.map((row) => (
          <Fragment key={row.startDate}>
            <section className="linkedin">
              <p className="company">
                {row.company}
              </p>
              {row.position ? (
                <p className="position">
                  {row.position}
                </p>
              ) : null}
              {row.date ? (
                <p className="date">
                  {row.date}
                  {' '}
                  {`${row.duration}`}
                </p>
              ) : null}
              {row.location ? (
                <p className="location">
                  {row.location}
                </p>
              ) : null}
              <br />
              {row.summary ? (
                <p className="summary">
                  {row.summary}
                </p>
              ) : null}
              {row.startDate ? (
                <p className="visually-hidden">
                  <strong>startDate: </strong>
                  {row.startDate}
                  <strong>endDate: </strong>
                  {row.endDate}
                </p>
              ) : null}
              {row.date ? (
                <p className="visually-hidden">
                  <strong>date: </strong>
                  {row.date}
                </p>
              ) : null}
              {row.duration ? (
                <p className="visually-hidden">
                  <strong>duration: </strong>
                  {row.duration}
                </p>
              ) : null}

            </section>
            <hr />
          </Fragment>
        ))}
      </>
    );
  }

  renderEduction = () => {
    const { data } = this.props;
    if (_.isEmpty(data.education)) {
      return null;
    }
    return (
      <>
        {data.education.map((row) => (
          <Fragment key={row.name}>
            <div className="linkedin">
              {row.institution ? (
                row.wikipedia ? (
                  <a href={`https://en.wikipedia.org/wiki/${row.institution}`} target="_blank" rel="noreferrer">
                    {row.institution}
                  </a>
                ) : (
                  <p className="institution">
                    {row.institution}
                  </p>
                )
              ) : null}
              {row.studyData ? (
                <p className="studyData">
                  {row.studyData}
                </p>
              ) : null}
              {row.studyType ? (
                <p className="visually-hidden">
                  <strong>studyType: </strong>
                  {row.studyType}
                </p>
              ) : null}
              {row.startDate ? (
                <p className="visually-hidden">
                  <strong>date: </strong>
                  {`${row.startDate} - ${row.endDate}`}
                </p>
              ) : null}
              <br />
            </div>
          </Fragment>
        ))}
      </>
    );
  }

  renderSkills = () => {
    const { data } = this.props;
    if (_.isEmpty(data.skills)) {
      return null;
    }
    return (
      <>
        {data.skills.map((row, index) => (
          <Fragment key={row.name}>
            <div className="linkedin">
              <p>
                <strong className="skills">
                  {`${index + 1}. `}
                </strong>
                {row.name}
              </p>
            </div>
          </Fragment>
        ))}
      </>
    );
  }

  render() {
    const { type } = this.props;

    if (type === 'experience') {
      return this.renderWork();
    }

    if (type === 'education') {
      return this.renderEduction();
    }

    if (type === 'skills') {
      return this.renderSkills();
    }

    return null;
  }
}

export default ImportLinkedinCustomField;
