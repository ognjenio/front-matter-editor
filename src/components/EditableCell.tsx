import React from 'react';
import { createStyles, withStyles, fade } from '@material-ui/core/styles';
import ContentEditable from 'react-contenteditable';

const styles = theme => createStyles({
  contentEditable: (props) => ({
    fontFamily: (props.type == 'object' ? 'monospace': 'Roboto, sans-serif'),
    fontSize: (props.type == 'object' ? '11px': '13px'),
    lineHeight: (props.type == 'object' ? '11px': '13px'),
    color: theme.color,
    width: "100%",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.action.hover,
    wordWrap: 'break-word',
    overflowwrap: 'break-word',
    whiteSpace: 'normal'
  }),
});


class EditableCell extends React.Component {
  constructor(props){
    super(props)
    this.save = (e) => {
      if (e.currentTarget.innerHTML != this.props.start){
        this.props.save(this.props.filename, this.props.attribute, e.currentTarget.innerText)
      }
    };

    this.preventEnter = (e) => {
      if (e.keyCode == 13 && !e.shiftKey){
        e.preventDefault();
        e.stopPropagation();
      } else if (e.keyCode == 27){
        this.contentEditable.current.innerText = this.props.start;
        this.contentEditable.current.blur();
      }
    }

    this.contentEditable = React.createRef();
  }

  render(){

    const {classes} = this.props;

    return(
      <ContentEditable
        className={classes.contentEditable}
        innerRef={this.contentEditable}
        html={this.props.start} // innerHTML of the editable div
        disabled={false}       // use true to disable editing
        onBlur={this.save} // handle innerHTML change
        onKeyDown={this.preventEnter}
      />
    )
  }
}

export default withStyles(styles, { withTheme: true })(EditableCell);
