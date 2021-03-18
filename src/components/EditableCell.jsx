import React from 'react';
import EasyEdit from 'react-easy-edit';

class EditableCell extends React.Component {
  constructor(props){
    super(props)
    this.row = props.row;
    this.save = (e) => {
      this.props.save(this.row.filename, e)
    };
    this.cancel = (e) => {
      console.log("Cancel")
    };
  }
  render(){
    return(
      <EasyEdit type="text" value={this.row.title} onSave={this.save} onCancel={this.cancel} saveButtonLabel="Save" cancelButtonLabel="&times;"/>
    )
  }
}

export default EditableCell;
