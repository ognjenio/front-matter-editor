import './App.global.css';
import { ValueFormatterParams } from '@material-ui/data-grid';
import React from 'react';
import TopBar from './TopBar';
import Editor from './Editor';
import EditableCell from './components/EditableCell';
import { Button, CircularProgress, IconButton } from '@material-ui/core';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';


class App extends React.Component<{}, {message: string, open: boolean, filterString: string, nothing: boolean, filterAttribute: string, visibleRows: string[], directory: string, schema: Object, rows: Array, loading: boolean }> {
  NON_COLUMNS: string[];
  constructor(props: {} | Readonly<{}>){
    super(props);

    this.NON_COLUMNS = ['id', 'filename', 'created', 'updated']

    this.state = {
      filterString: '',
      filterAttribute: 'filename',
      visibleRows: [],
      directory: '/home/regac/test-vault/',
      schema: {},
      rows: [],
      loading: false,
      nothing: true,
      open: false,
      message: ''
    }

    this.loadDirectory = this.loadDirectory.bind(this);
    this.saveFile = this.saveFile.bind(this);
    this.setVisibleRows = this.setVisibleRows.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.reloadWithFilter = this.reloadWithFilter.bind(this);
    this.bulkUpdate = this.bulkUpdate.bind(this);
  }

  bulkUpdate(column: string, value: string, onlyEmpty: boolean){
    this.state.visibleRows.forEach((row: string) => {
      this.saveFile(row, column, value, onlyEmpty);
    })

    var message = "Updating " + this.state.visibleRows.length + "..."
    if (onlyEmpty){
      message = message + " (but only if empty)"
    }

    this.setState({
      open: true,
      message: message
    })
  }

  reloadWithFilter = (directory: string, filter: string) => {
    this.setState({filterString: filter}, () => this.loadDirectory(directory))
  }

  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({open: false})
  };

  setVisibleRows(rows: string[]){
    this.setState({visibleRows: rows})
  }

  rows(): Array<{}> {
    return this.state.rows.map((x) => {
      if (!x.id){
        x.id = x.filename
      }
      return x
    })
  }

  columns(): Array<{}>{
    var newColumns = [
      {
        headerName: 'Filename',
        field: 'filename',
        width: 300,
        valueFormatter: (params: ValueFormatterParams) => {
          var a = (params.value as String).split(".");
          return a[a.length - 2];
        }
      }
    ]

    var zis = this;

    Object.keys(this.state.schema).forEach(key => {
      var column = this.state.schema[key];
      if (key != 'content'){
        newColumns.push({
          field: key,
          headerName: key,
          width: 300,
          renderCell: (function (params: { row: { [x: any]: any; filename: string; }; }) {
            var current = params.row[key];
            if (current == undefined){
              current = ''
            } else {
              try {
                if (column.type == 'array'){
                  current = current.join(", ");
                } else if (column.type == 'object') {
                  current = JSON.stringify(current);
                } else {
                  current = current.toString();
                }
              } catch (e){
                current = '';
              }
            }
            return (<EditableCell filename={params.row.filename} start={current} type={column.type} attribute={key} save={zis.saveFile}/>);
          })
        })
      }
    })



    return newColumns;
    // exclude objects

  }

  saveFile(row: string, attribute: string, value:string, onlyEmpty: boolean){
    var cur = this.state.rows.find((x) => x.filename == row);
    var all = {...cur}

    delete all.content
    delete all.filename

    const type: string = this.state.schema[attribute].type;

    if (value !== ''){
      if (['object', 'number', 'boolean'].indexOf(type) > -1){
        try {
          all[attribute] = JSON.parse(value)
        } catch (e){
          this.setState({
            open: true,
            message: "Failed parse JSON.\n\n" + e
          })
          console.error("Failed to parse value.")
          console.error(e);
        }
      } else if (type == 'array'){
        all[attribute] = value.split(",").map((x) => x.trim())
      } else {
        all[attribute] = value;
      }
    } else {
      all[attribute] = null;
    }

    console.log(onlyEmpty)

    if (all[attribute] != cur[attribute] && (!onlyEmpty || (onlyEmpty && (cur[attribute] == null || cur[attribute].toString() == '')))){
      const matter = require('gray-matter');
      const fs = require('fs');

      try {
        var content = matter.stringify(cur.content, all);
      } catch (e) {
        this.setState({
          open: true,
          message: "Failed parse YAML.\n\n" + e
        })
      }

      fs.writeFile(this.state.directory + cur.filename, content, function (err: string) {
        if (err) return console.log(err);
        console.log('written: ', cur.filename);
        cur[attribute] = all[attribute];
      });
    }
  }

  loadDirectory(directory: string){
    if (directory[directory-1] != '/'){
      directory = directory + "/"
    }
    this.setState({directory: directory, loading: true}, () => {

      var newRows: Array<{}> = [];

      console.log(this.state.filterString)

      const matter = require('gray-matter');
      const fs = require('fs');

      if (fs.existsSync(this.state.directory)) {

        this.setState({
          loading: true,
          nothing: false,
          rows: [],
          schema: {},
          visibleRows: []
        });

        var failed: string[] = [];

        fs.readdir(this.state.directory, {}, (err: string, files: string[]) => {
          if (err) return console.error(err);
          files.forEach(file => {
            if ((file.indexOf(".md") > -1 || file.indexOf(".markdown") > -1) && (this.state.filterString == '' || file.indexOf(this.state.filterString) > -1)){
              try {
                var currentFile: {content:string, data: {filename: string, content: string, id: string}} = matter(fs.readFileSync(this.state.directory + file, 'utf-8'));

                currentFile.data.filename = file;
                currentFile.data.content = currentFile.content;

                newRows.push(currentFile);
              } catch (e) {
                failed.push(file);
                console.error("Failed to parse " + file);
                console.error(e);
              }
            }
          });

          newRows = newRows.map((x) => x.data)

          var newSchema = {}

          const templateSchema = {
            name: '',
            type: 'string'
          }

          newRows.forEach(row => {
            Object.keys(row).forEach((key) => {
              if (this.NON_COLUMNS.indexOf(key) == -1){
                if (!newSchema[key]){
                  newSchema[key] = {...templateSchema};
                }

                var currentSchema = newSchema[key];

                currentSchema.name = key;

                if (Array.isArray(row[key])){
                  if (typeof row[key][0] === 'object'){
                    currentSchema.type = 'object';
                  } else {
                    currentSchema.type = 'array';
                  }
                } else if (typeof row[key] !== 'string'){
                  currentSchema.type = typeof row[key];
                }

              }
            });
          });

          this.setState({
            rows: newRows,
            schema: newSchema,
            loading: false,
            open: true,
            visibleRows: newRows.map((x) => x.filename),
            message: newRows.length + " loaded. " + failed.length.toString() + " failed to load." + (failed.join((x) => x + ", \n"))
          });
        });


      } else {
        this.setState({
          open: true,
          message: "That folder doesn't exist."
        })
        console.error("Folder doesn't exist.")
      }
    });
  }
  render(){
    var loadingOrGrid = <Editor rows={this.rows()} columns={this.columns()} setVisibleRows={this.setVisibleRows} reloadWithFilter={this.reloadWithFilter} bulkUpdate={this.bulkUpdate}/>;

    // if (this.state.nothing){
    //   loadingOrGrid = <div style={{textAlign: 'center'}}><h1>Type in a directory and press enter.</h1></div>
    // } else if (this.state.loading) {
    //   loadingOrGrid = <CircularProgress />
    // }
    return (
      <div>
        <TopBar loadDirectory={this.reloadWithFilter} directory={this.state.directory} filter={this.state.filterString}/>
        {loadingOrGrid}

        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={this.state.open}
          autoHideDuration={6000}
          onClose={this.handleClose}
          message={this.state.message}
          action={
            <React.Fragment>
              <IconButton size="small" aria-label="close" color="inherit" onClick={this.handleClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />
      </div>
    );
  }
}

export default App;
