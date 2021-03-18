import React from 'react';
import EasyEdit from 'react-easy-edit';

class EditableCell extends React.Component {
  constructor(props){
    super(props)
    this.row = props.row;
    this.save = (e) => {
      this.props.save(this.row.filename, this.props.attribute, e.currentTarget.value)
    };
    this.cancel = (e) => {
      console.log("Cancel")
    };
  }
  render(){
    return(
      <input type="text" className="bordered" defaultValue={this.row[this.props.attribute]} onBlur={this.save}/>
    )
  }
}

export default EditableCell;
