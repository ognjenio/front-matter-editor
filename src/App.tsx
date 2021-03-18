import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.global.css';

import DataTable from 'react-data-table-component';
import EditableCell2 from './components/EditableCell2';

class Hello extends React.Component {
  save: (row: string, attribute: string, value: string) => void;

  constructor(props: {} | Readonly<{}>){
    super(props);

    var zis = this;

    this.directoryInput = React.createRef();

    var ipcRenderer = require('electron').ipcRenderer;
    ipcRenderer.on('home-directory', function (event,store) {
      zis.setState({directory: store})
    });


    this.state = {
      filterString: '',
      filterAttribute: 'filename',
      selectedRows: [],
      directory: window.home + "/test-vault/"
    }

    console.log(this.state.directory)

    this.save = (row, attribute, value) => {
      var cur = this.rows.find((x) => x.filename == row);
      var all = {...cur}

      delete all.content
      delete all.filename

      console.log(this.schema[attribute].type)
      if (this.schema[attribute].type == 'array'){
        all[attribute] = value.split(",").map((x) => x.trim())
      } else {
        all[attribute] = value;
      }

      var n = {
        data: all,
        content: cur.content
      }

      // Sometimes this fails
      try {
        var content = matter.stringify(cur.content, all);
      } catch (e) {
        debugger;
      }

      if (value != cur[attribute]){
        fs.writeFile(this.directory + cur.filename, content, function (err) {
          if (err) return console.log(err);
          console.log('written: ', cur.filename);
          cur[attribute] = value;

        });
      }
    }

    this.schema = {

    }


    this.loadDirectory = () => {
      var zis = this;
      this.rows = []
      const matter = require('gray-matter');
      const fs = require('fs');
      var files = fs.readdirSync(this.state.directory);
      files.forEach(file => {
        if (file.indexOf(".md") > -1 || file.indexOf(".markdown") > -1){
          var a = matter(fs.readFileSync(this.state.directory + file, 'utf-8'));
          a.data.filename = file;
          a.data.content = a.content;
          zis.rows.push(a);
        }
      });
      //console.log(this.rows)
      //this.rows = this.rows.map((x) => <TableRow key={x.data.id} id={x.data.id} title={x.data.title} />)
      //this.rows = this.rows.map((x) => return {id: x.data.id, title: x.data.title})
      this.rows = this.rows.map((x) => x.data)

      this.columns = [
        {
          name: 'Filename',
          selector: (row, index) => {
            var a = row.filename.split(".");
            return a[a.length - 2]
          },
          sortable: true,
        },
        {
          name: 'ID',
          selector: 'id',
          sortable: true,
        }
      ]

      this.schema = {

      }

      this.templateSchema = {
        name: '',
        type: 'string'
      }

      this.NON_COLUMNS = [
        'content', 'id', 'filename'
      ]

      for (var row of this.rows){
        Object.keys(row).forEach((key) => {
          if (this.NON_COLUMNS.indexOf(key) == -1){
            if (!this.schema[key]){
              this.schema[key] = {...this.templateSchema};

              this.columns.push({
                name: key,
                selector: key,
                sortable: true,
                cell: row => <EditableCell2 row={row} attribute={key} save={this.save}/>
              })

            }
            var currentSchema = this.schema[key];

            currentSchema.name = key;

            if (Array.isArray(row[key])){
              currentSchema.type = 'array';
            }
          }
        });
      }

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
      var d = state.target.value;
      if (d[d.length - 1] != "/"){
        d = d + '/'
      }
      this.setState({directory: d});
    }

  }
  render() {
    var filteredRows = [];
    if (this.state.filterString != ""){
      filteredRows = this.rows.filter((x) => {
        x[this.state.filterAttribute] != undefined && x[this.state.filterAttribute] != null &&
        (
          (this.schema[this.state.filterAttribute].type != 'array' && x[this.state.filterAttribute].toLowerCase().indexOf(this.state.filterString.toLowerCase()) > -1) ||
          (this.schema[this.state.filterAttribute].type == 'array' && x[this.state.filterAttribute].map((x) => x.toLowerCase()).indexOf(this.state.filterString.toLowerCase()) > -1)
        )
      })
    } else {
      filteredRows = this.rows;
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
      <div>
        <div className="bg-gray-500 p-5 text-center">Tailwind</div>

        <label htmlFor="directory">Directory</label>
        <input type="text" onChange={this.setDirectory} ref={this.directoryInput} className="bordered" defaultValue={this.state.directory} id="directory" />
        <button onClick={this.loadDirectory}>Load</button>

        <form action="">
          <label htmlFor="filter">Filter</label>
          <input type="text" className="bordered" id="filter" onChange={this.setFilter}/>
          <br/><br/>
          <label htmlFor="attribute">Attribute</label>
          <select className="bordered" id="attribute" onChange={this.setAttribute}>
            {Object.keys(this.schema).map((item,index)=>{
              return <option key={index} value={item}>{item}</option>
            })}
          </select>
        </form>

        {bulk}

        <DataTable
          title="Files"
          columns={this.columns}
          data={filteredRows}
          striped={true}
          highlightOnHover={true}
          persistTableHead={true}
          dense={true}
          pagination={true}
          paginationPerPage={50}
          paginationRowsPerPageOptions={[10, 20, 50, 100, 500]}
          fixedHeader={true}
          fixedHeaderScrollHeight={"75vh"}
          selectableRows // add for checkbox selection
          onSelectedRowsChange={this.handleChange}
        />
      </div>

    );

  }
}

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Hello} />
      </Switch>
    </Router>
  );
}
