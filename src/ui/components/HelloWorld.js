import React, { Component } from 'react'

import PropTypes from 'prop-types'

import { Widget, WidgetHeader, WidgetBody } from '@mozaik/ui'

/**
 * Displays the total non-comment lines of source code in a project.
 *
 * Requires one configuration parameter, project.  Project is the name of
 * the repository to get information about.
 */
export default class HelloWorld extends Component {
  constructor() {
    super();

    this.propTypes ={
      apiData: PropTypes.object,
      theme: PropTypes.object,
    };
  }



  render() {
    return (
      <Widget>
        <WidgetHeader title="Hello" />
        <WidgetBody>World.</WidgetBody>
      </Widget>
    )
  }
}
