import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.global.css';

import { Button, TextField, Select, FormControl, AppBar, InputBase, Toolbar, Typography} from '@material-ui/core';
import { DataGrid, GridCellParams, ValueFormatterParams } from '@material-ui/data-grid';
import FolderIcon from '@material-ui/icons/Folder';

import { fade, makeStyles } from '@material-ui/core/styles';
import { createStyles, withStyles, WithStyles } from "@material-ui/core/styles";

import EditableCell2 from './components/EditableCell2';

const styles = theme => createStyles({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 0.5,
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  search: {
    position: 'relative',
    flexGrow: 0.5,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
  FolderIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
    display: 'block',
    flexGrow:  1
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    flexGrow: 1,
    // vertical padding + font size from FolderIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: 'auto'
  },
});

interface Props extends WithStyles<typeof styles>{ }

class Hello extends React.Component<{}, { filterString: string, filterAttribute: string, selectedRows: Array, directory: string, schema: Object, rows: Array, columns: Array }> {
  [x: string]: (e: any) => void;
  save: (row: string, attribute: string, value: string) => void;

  constructor(props: {} | Readonly<{}>){
    super(props);
    var zis = this;

    this.directoryInput = React.createRef();

    var ipcRenderer = require('electron').ipcRenderer;
    ipcRenderer.on('home-directory', function (event,store) {
      zis.setState({directory: store})
      zis.directoryInput.current.value = store;
    });

    const templateSchema = {
      name: '',
      type: 'string'
    }

    this.NON_COLUMNS = [
      'content', 'id', 'filename', 'updated', 'created'
    ]

    this.state = {
      filterString: '',
      filterAttribute: 'filename',
      selectedRows: [],
      directory: '/home/regac/test-vault/',
      schema: {},
      rows: [],
      columns: []
    }

    this.save = (row, attribute, value) => {
      var cur = this.state.rows.find((x) => x.filename == row);
      var all = {...cur}

      delete all.content
      delete all.filename

      console.log("Type: ", this.state.schema[attribute].type)

      if (this.state.schema[attribute].type == 'array'){
        all[attribute] = value.split(",").map((x) => x.trim())
      } else {
        all[attribute] = value;
      }

      const matter = require('gray-matter');
      const fs = require('fs');
      // Sometimes this fails
      try {
        var content = matter.stringify(cur.content, all);
      } catch (e) {
        debugger;
      }

      console.log(content)

      if (value != cur[attribute]){
        fs.writeFile(this.state.directory + cur.filename, content, function (err) {
          if (err) return console.log(err);
          console.log('written: ', cur.filename);
          cur[attribute] = value;
        });
      }
    }


    this.loadDirectory = () => {
      var newRows = []
      const matter = require('gray-matter');
      const fs = require('fs');
      var files = fs.readdirSync(this.state.directory);
      files.forEach(file => {
        if (file.indexOf("marketplace") > -1 || file.indexOf(".markdown") > -1){
          var a = matter(fs.readFileSync(this.state.directory + file, 'utf-8'));
          a.data.filename = file;
          a.data.content = a.content;
          a.data.id  = a.data.filename;
          newRows.push(a);
        }
      });
      //console.log(this.state.rows)
      //this.state.rows = this.state.rows.map((x) => <TableRow key={x.data.id} id={x.data.id} title={x.data.title} />)
      //this.state.rows = this.state.rows.map((x) => return {id: x.data.id, title: x.data.title})
      newRows = newRows.map((x) => x.data)

      var newColumns = [
        {
          headerName: 'Filename',
          field: 'filename',
          valueFormatter: (params: ValueFormatterParams) => {
            var a = (params.value as String).split(".");
            return a[a.length - 2];
          }
        }
      ]

      var newSchema = {}

      for (var row of newRows){
        Object.keys(row).forEach((key) => {
          if (this.NON_COLUMNS.indexOf(key) == -1){
            if (!newSchema[key]){
              newSchema[key] = {...templateSchema};

              newColumns.push({
                field: key,
                headerName: key,
                width: 200,
                renderCell: (params: GridCellParams) => (
                  <EditableCell2 row={params} attribute={key} save={this.save}/>
                )
              })

            }
            var currentSchema = newSchema[key];

            currentSchema.name = key;

            if (Array.isArray(row[key])){
              currentSchema.type = 'array';
            }
          }
        });
      }

      this.setState({
        rows: newRows,
        schema: newSchema,
        columns: newColumns
      })
    }

    this.setFilter = (e) => {
      this.setState({ filterString: e.currentTarget.value });
    }

    this.setAttribute = (e) => {
      this.setState({ filterAttribute: e.target.value });
      //this.setState({ filterAttribute: e.currentTarget.value });
    }

    this.handleChange = (state) => {
      // You can use setState or dispatch with something like Redux so we can use the retrieved data
      this.setState({ selectedRows: state.selectedRows.map((x) => x.filename) });
    };

    this.setDirectory = (state) => {
      if (state.keyCode == 13) {
        this.loadDirectory()
      } else {
        var d = state.target.value;
        if (d[d.length - 1] != "/"){
          d = d + '/'
        }
        this.setState({directory: d});
      }
    }

  }
  render() {
    const { classes } = this.props;

    var filteredRows = [];
    if (this.state.filterString != ""){
      filteredRows = this.state.rows.filter((x) => {
        return x[this.state.filterAttribute] != undefined && x[this.state.filterAttribute] != null &&
        (
          (this.state.schema[this.state.filterAttribute].type != 'array' && x[this.state.filterAttribute].toLowerCase().indexOf(this.state.filterString.toLowerCase()) > -1) ||
          (this.state.schema[this.state.filterAttribute].type == 'array' && x[this.state.filterAttribute].map((x: string) => x.toLowerCase()).indexOf(this.state.filterString.toLowerCase()) > -1)
        )
      })
    } else {
      filteredRows = this.state.rows;
    }

    var bulk = null;
    if (this.state.selectedRows.length > 0){
      bulk = (
        <div>
          <h3>Bulk</h3>
        </div>
      )
    }

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <Typography className={classes.title} variant="h6" noWrap>
              YAML Editor
            </Typography>
            <div className={classes.search}>
              <div className={classes.FolderIcon}>
                <FolderIcon />
              </div>
              <InputBase
                placeholder="Search…"
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                inputProps={{ 'aria-label': 'search' }}
                onKeyUp={this.setDirectory}
                ref={this.directoryInput}
                defaultValue={this.state.directory}
              />
            </div>
          </Toolbar>
        </AppBar>

        <div style={{ height: 100, width: '100%' }}>
          <FormControl variant="filled">
            <TextField label="Filter" variant="outlined" onChange={this.setFilter} />
            <Select
                native
                onChange={this.setAttribute}
              >
              {Object.keys(this.state.schema).map((item,index)=>{
                return <option value={item}>{item}</option>
              })}
            </Select>
          </FormControl>

          {bulk}
        </div>
        <div style={{ height: "85vh", width: '100%' }}>
          <DataGrid rows={filteredRows} columns={this.state.columns} density={"compact"} pageSize={100} checkboxSelection />
        </div>

      </div>

    );

  }
}
export default withStyles(styles, { withTheme: true })(Hello);
