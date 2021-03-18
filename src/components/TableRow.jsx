import React from 'react';

class TableRow extends React.Component {
  constructor(props){
    super(props)
  }
  render(){
    return(
      <tr key={this.props.id}>
        <td><small>{this.props.id}</small></td>
        <td>{this.props.title}</td>
      </tr>
    )
  }
}

export default TableRow;
