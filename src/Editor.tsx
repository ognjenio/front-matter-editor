import React from 'react';
import { DataGrid, GridToolbar } from '@material-ui/data-grid';
import Actions from './components/Actions';

class Editor extends React.Component<{}, {}> {
  constructor(props: {rows: Array<{}>, columns: Array<{}>, setVisibleRows: (string[])} | Readonly<{rows: Array<{}>, columns: Array<{}>, setVisibleRows: (string[]), reloadWithFilter: (string), bulkUpdate(string, string)}>){
    super(props);

    this.filterRows = this.filterRows.bind(this);
  }
  filterRows(e){
    this.props.setVisibleRows(e.visibleRows.map((x) => x.filename));
  }
  render(){
    return (
      <div>
        <Actions columns={this.props.columns} bulkUpdate={this.props.bulkUpdate}/>
        <DataGrid
          rows={this.props.rows}
          columns={this.props.columns}
          density={"comfortable"}
          disableSelectionOnClick={true}
          hideFooter={true}
          autoHeight={true}
          columnBuffer={20}
          onFilterModelChange={this.filterRows}
          components={{
            Toolbar: GridToolbar,
          }}/>
      </div>
    )
  }
}

export default Editor;
