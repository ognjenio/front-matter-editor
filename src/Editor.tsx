import React from 'react';
import PropTypes from 'prop-types';
import { DataGrid, GridToolbar } from '@material-ui/data-grid';
import Actions from './components/Actions';

class Editor extends React.Component {
  constructor(props: {
    rows: Array<Record<string, unknown>>;
    columns: Array<Record<string, unknown>>;
    setVisibleRows: string[];
    bulkUpdate: (attribute: string, value: string) => void;
  }) {
    super(props);

    this.filterRows = this.filterRows.bind(this);
  }

  filterRows(e) {
    this.props.setVisibleRows(e.visibleRows.map((x) => x.filename));
  }

  render() {
    return (
      <div>
        <Actions
          columns={this.props.columns}
          bulkUpdate={this.props.bulkUpdate}
        />
        <DataGrid
          rows={this.props.rows}
          columns={this.props.columns}
          density="comfortable"
          disableSelectionOnClick
          hideFooter
          autoHeight
          columnBuffer={20}
          onFilterModelChange={this.filterRows}
          components={{
            Toolbar: GridToolbar,
          }}
        />
      </div>
    );
  }
}

Editor.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  setVisibleRows: PropTypes.arrayOf(PropTypes.string).isRequired,
  bulkUpdate: PropTypes.func.isRequired,
};

export default Editor;
