import React from 'react';
import PropTypes from 'prop-types';
import { createStyles, withStyles } from '@material-ui/core/styles';
import ContentEditable from 'react-contenteditable';

const styles = (theme) =>
  createStyles({
    contentEditable: (props) => ({
      fontFamily: props.type === 'object' ? 'monospace' : 'Roboto, sans-serif',
      fontSize: props.type === 'object' ? '11px' : '13px',
      lineHeight: props.type === 'object' ? '11px' : '13px',
      color: theme.color,
      width: '100%',
      padding: theme.spacing(1),
      backgroundColor: theme.palette.action.hover,
      wordWrap: 'break-word',
      overflowwrap: 'break-word',
      whiteSpace: 'normal',
    }),
  });

class EditableCell extends React.Component {
  save: (e: Event) => void;

  constructor(props: {
    start: string;
    attribute: string;
    filename: string;
    save: (filename: string, attribute: string, value: string) => void;
  }) {
    super(props);
    this.save = (e) => {
      if (e.currentTarget.innerHTML !== this.props.start) {
        this.props.save(
          this.props.filename,
          this.props.attribute,
          e.currentTarget.innerText
        );
      }
    };

    this.preventEnter = (e) => {
      if (e.keyCode === 13 && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
      } else if (e.keyCode === 27) {
        this.contentEditable.current.innerText = this.props.start;
        this.contentEditable.current.blur();
      }
    };

    this.contentEditable = React.createRef();
  }

  render() {
    /* eslint-disable react/prop-types */
    const { classes } = this.props;
    /* eslint-enable react/prop-types */

    return (
      <ContentEditable
        /* eslint-disable react/prop-types */
        className={classes.contentEditable}
        /* eslint-enable react/prop-types */
        innerRef={this.contentEditable}
        html={this.props.start} // innerHTML of the editable div
        disabled={false} // use true to disable editing
        onBlur={this.save} // handle innerHTML change
        onKeyDown={this.preventEnter}
      />
    );
  }
}

EditableCell.propTypes = {
  start: PropTypes.string.isRequired,
  attribute: PropTypes.string.isRequired,
  filename: PropTypes.string.isRequired,
  save: PropTypes.func.isRequired,
};

export default withStyles(styles, { withTheme: true })(EditableCell);
