import { ValueFormatterParams } from '@material-ui/data-grid';
import React from 'react';
import TopBar from './TopBar';
import EditorGrid from './EditorGrid';
import EditableCell from './components/EditableCell';
import { CircularProgress } from '@material-ui/core';

class App extends React.Component<{}, { filterString: string, filterAttribute: string, visibleRows: string[], directory: string, schema: Object, rows: Array, loading: boolean }> {
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
      loading: false
    }

    this.loadDirectory = this.loadDirectory.bind(this);
    this.saveFile = this.saveFile.bind(this);
    this.setVisibleRows = this.setVisibleRows.bind(this);
  }

  setVisibleRows(rows: string[]){
    this.setState({visibleRows: rows})
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

    Object.keys(this.state.schema).forEach(key => {
      var column = this.state.schema[key];
      if (column.type != 'object' && key != 'content'){
        newColumns.push({
          field: key,
          headerName: key,
          width: 300,
          renderCell: (params: GridCellParams) => (
            <EditableCell row={params} type={this.state.schema[key].type} attribute={key} save={this.saveFile}/>
          )
        })
      } else if (column.type == 'object'){
        newColumns.push({
          headerName: key,
          field: key,
          width: 300,
          valueFormatter: (params: ValueFormatterParams) => {
            return JSON.stringify(params.value)
          },
          renderCell: (params: GridCellParams) => (
            <EditableCell row={params} type={this.state.schema[key].type} attribute={key} save={this.saveFile}/>
          )
        })
      }

    })



    return newColumns;
    // exclude objects

  }

  saveFile(row: string, attribute: string, value:string){
    var cur = this.state.rows.find((x) => x.filename == row);
    var all = {...cur}

    delete all.content
    delete all.filename

    if (value !== ''){
      if (this.state.schema[attribute].type == 'object'){
        try {
          all[attribute] = JSON.parse(value)
        } catch (e){
          console.error("Failed to parse value.")
          console.error(e);
        }
      } else if (this.state.schema[attribute].type == 'array'){
        all[attribute] = value.split(",").map((x) => x.trim())
      } else if (['number', 'boolean'].indexOf(this.state.schema[attribute].type) > -1){
        all[attribute] = JSON.parse(value)
      } else {
        all[attribute] = value;
      }
    } else {
      all[attribute] = null;
    }

    if (all[attribute] != cur[attribute]){
      const matter = require('gray-matter');
      const fs = require('fs');

      try {
        var content = matter.stringify(cur.content, all);
      } catch (e) {
        debugger;
      }

      fs.writeFile(this.state.directory + cur.filename, content, function (err) {
        if (err) return console.log(err);
        console.log('written: ', cur.filename);
        cur[attribute] = all[attribute];
      });
    }
  }

  loadDirectory(directory: string){
    this.setState({directory: directory, loading: true}, () => {

      var newRows: Array<{}> = [];

      const matter = require('gray-matter');
      const fs = require('fs');

      if (fs.existsSync(this.state.directory)) {

        var files = fs.readdirSync(this.state.directory);

        files.forEach(file => {
          if (file.indexOf(".md") > -1 || file.indexOf(".markdown") > -1){
            try {
              var currentFile: {content:string, data: {filename: string, content: string, id: string}} = matter(fs.readFileSync(this.state.directory + file, 'utf-8'));

              currentFile.data.filename = file;
              currentFile.data.content = currentFile.content;
              currentFile.data.id  = currentFile.data.filename;

              newRows.push(currentFile);
            } catch (e) {
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
          loading: false
        });

      } else {
        console.error("Folder doesn't exist.")
      }
    });
  }
  render(){
    var loadingOrGrid = <EditorGrid rows={this.state.rows} columns={this.columns()} setVisibleRows={this.setVisibleRows}/>;
    if (this.state.loading){
      loadingOrGrid = <CircularProgress />;
    }
    return (
      <div>
        <TopBar loadDirectory={this.loadDirectory}/>
        {loadingOrGrid}
      </div>
    );
  }
}

export default App;
