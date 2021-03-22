import React from 'react';
import { TextField } from '@material-ui/core';

class EditableCell extends React.Component {
  constructor(props){
    super(props)
    this.row = props.row.row;
    this.save = (e) => {
      this.props.save(this.row.filename, this.props.attribute, e.currentTarget.value)
    };

    this.value = this.value.bind(this);
  }

  value(){
    try {
      var current = this.row[this.props.attribute];
      if (this.props.type == 'array'){
        return current.join(", ");
      } else if (this.props.type == 'object') {
        return JSON.stringify(current);
      }
      return current;
    } catch (e){
      //console.error(e)
      return null;
    }
  }

  render(){
    return(
      <TextField multiline defaultValue={this.value()} onBlur={this.save}/>
    )
  }
}

export default EditableCell;
