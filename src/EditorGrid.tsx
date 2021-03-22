import React from 'react';
import { DataGrid, GridToolbar } from '@material-ui/data-grid';

class EditorGrid extends React.Component<{}, {}> {
  constructor(props: {rows: Array<{}>, columns: Array<{}>, setVisibleRows: (string[])} | Readonly<{rows: Array<{}>, columns: Array<{}>, setVisibleRows: (string[])}>){
    super(props);

    this.filterRows = this.filterRows.bind(this);
  }
  filterRows(e){
    this.props.setVisibleRows(e.visibleRows.map((x) => x.id));
  }
  render(){
    return (
      <div style={{ width: '100%', background: 'white' }}>
        <DataGrid
          rows={this.props.rows}
          columns={this.props.columns}
          density={"comfortable"}
          disableSelectionOnClick={true}
          hideFooter={true}
          autoHeight={true}
          onFilterModelChange={this.filterRows}
          components={{
            Toolbar: GridToolbar,
          }}/>
      </div>
    )
  }
}

export default EditorGrid;
