import './App.global.css';
import React from 'react';
import fs from 'fs';
import matter from 'gray-matter';
import { ValueFormatterParams } from '@material-ui/data-grid';
import { IconButton } from '@material-ui/core';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';
import Editor from './Editor';
import TopBar from './TopBar';
import EditableCell from './components/EditableCell';

class App extends React.Component<
  Record<string, unknown>,
  {
    message: string;
    open: boolean;
    filterString: string;
    visibleRows: string[];
    directory: string;
    schema: Record<string, unknown>;
    rows: Array<Record<string, unknown>>;
  }
> {
  NON_COLUMNS: string[];

  constructor(
    props: Record<string, unknown> | Readonly<Record<string, unknown>>
  ) {
    super(props);

    this.NON_COLUMNS = ['id', 'filename', 'created', 'updated'];

    this.state = {
      filterString: '',
      visibleRows: [],
      directory: '/home/regac/test-vault/',
      schema: {},
      rows: [],
      open: false,
      message: '',
    };

    this.bulkUpdate = this.bulkUpdate.bind(this);
    this.loadDirectory = this.loadDirectory.bind(this);
    this.saveFile = this.saveFile.bind(this);
    this.reloadWithFilter = this.reloadWithFilter.bind(this);
    this.setVisibleRows = this.setVisibleRows.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  setVisibleRows(rows: string[]) {
    this.setState({ visibleRows: rows });
  }

  handleClose = (_event: Event, reason: string) => {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({ open: false });
  };

  reloadWithFilter = (directory: string, filter: string) => {
    this.setState({ filterString: filter }, () =>
      this.loadDirectory(directory)
    );
  };

  bulkUpdate(column: string, value: string, onlyEmpty: boolean) {
    this.state.visibleRows.forEach((row: string) => {
      this.saveFile(row, column, value, onlyEmpty);
    });

    let message = `Updating ${this.state.visibleRows.length}...`; // eslint-disable-line react/no-access-state-in-setstate
    if (onlyEmpty) {
      message += ' (but only if empty)';
    }

    this.setState({
      open: true,
      message,
    });
  }

  rows(): Array<Record<string, unknown>> {
    return this.state.rows.map((x) => {
      if (!x.id) {
        x.id = x.filename;
      }
      return x;
    });
  }

  columns(): Array<Record<string, unknown>> {
    const newColumns = [
      {
        headerName: 'Filename',
        field: 'filename',
        width: 300,
        valueFormatter: (params: ValueFormatterParams) => {
          const a = (params.value as string).split('.');
          return a[a.length - 2];
        },
      },
    ];

    Object.keys(this.state.schema).forEach((key) => {
      const column = this.state.schema[key];
      if (key !== 'content') {
        newColumns.push({
          field: key,
          headerName: key,
          width: 300,
          renderCell: (params: { row: { filename: string } }) => {
            let current = params.row[key];
            if (current === undefined) {
              current = '';
            } else {
              try {
                if (column.type === 'array') {
                  current = current.join(', ');
                } else if (column.type === 'object') {
                  current = JSON.stringify(current);
                } else {
                  current = current.toString();
                }
              } catch (e) {
                current = '';
              }
            }
            return (
              <EditableCell
                filename={params.row.filename}
                start={current}
                type={column.type}
                attribute={key}
                save={this.saveFile}
              />
            );
          },
        });
      }
    });

    return newColumns;
  }

  saveFile(
    row: string,
    attribute: string,
    value: string,
    onlyEmpty: boolean
  ): void {
    const cur = this.state.rows.find((x) => x.filename === row);
    const all = { ...cur };

    delete all.content;
    delete all.filename;

    const { type } = this.state.schema[attribute];

    if (value !== '') {
      if (['object', 'number', 'boolean'].indexOf(type) > -1) {
        try {
          all[attribute] = JSON.parse(value);
        } catch (e) {
          this.setState({
            open: true,
            message: `Failed parse JSON.\n\n${e}`,
          });
          console.error('Failed to parse value.');
          console.error(e);
        }
      } else if (type === 'array') {
        all[attribute] = value.split(',').map((x) => x.trim());
      } else {
        all[attribute] = value;
      }
    } else {
      all[attribute] = null;
    }

    if (
      all[attribute] !== cur[attribute] &&
      (!onlyEmpty ||
        (onlyEmpty &&
          (cur[attribute] === null || cur[attribute].toString() === '')))
    ) {
      try {
        const content = matter.stringify(cur.content, all); // eslint-disable-line @typescript-eslint/no-unused-vars
      } catch (e) {
        this.setState({
          open: true,
          message: `Failed parse YAML.\n\n${e}`,
        });
      }

      fs.writeFile(
        this.state.directory + cur.filename,
        content,
        (err: string) => {
          if (err) return console.error(err);
          cur[attribute] = all[attribute];
          return true;
        }
      );
    }
  }

  loadDirectory(directory: string) {
    if (directory[directory - 1] !== '/') {
      directory += '/'; // eslint-disable-line no-param-reassign
    }
    this.setState({ directory }, () => {
      let newRows: Array<Record<string, unknown>> = [];

      if (fs.existsSync(this.state.directory)) {
        this.setState({
          rows: [],
          schema: {},
          visibleRows: [],
        });

        const failed: string[] = [];

        fs.readdir(this.state.directory, {}, (err: string, files: string[]) => {
          if (err) return console.error(err);
          files.forEach((file) => {
            if (
              (file.indexOf('.md') > -1 || file.indexOf('.markdown') > -1) &&
              (this.state.filterString === '' ||
                file.indexOf(this.state.filterString) > -1)
            ) {
              try {
                const currentFile: {
                  content: string;
                  data: { filename: string; content: string; id: string };
                } = matter(
                  fs.readFileSync(this.state.directory + file, 'utf-8')
                );

                currentFile.data.filename = file;
                currentFile.data.content = currentFile.content;

                newRows.push(currentFile);
              } catch (e) {
                failed.push(file);
                console.error(`Failed to parse ${file}`);
                console.error(e);
              }
            }
          });

          newRows = newRows.map((x) => x.data);

          const newSchema = {};

          const templateSchema = {
            name: '',
            type: 'string',
          };

          newRows.forEach((row) => {
            Object.keys(row).forEach((key) => {
              if (this.NON_COLUMNS.indexOf(key) === -1) {
                if (!newSchema[key]) {
                  newSchema[key] = { ...templateSchema };
                }

                const currentSchema = newSchema[key];

                currentSchema.name = key;

                if (Array.isArray(row[key])) {
                  if (typeof row[key][0] === 'object') {
                    currentSchema.type = 'object';
                  } else {
                    currentSchema.type = 'array';
                  }
                } else if (typeof row[key] !== 'string') {
                  currentSchema.type = typeof row[key];
                }
              }
            });
          });

          this.setState({
            rows: newRows,
            schema: newSchema,
            open: true,
            visibleRows: newRows.map((x) => x.filename),
            message: `${
              newRows.length
            } loaded. ${failed.length.toString()} failed to load.${failed.join(
              (x) => `${x}, \n`
            )}`,
          });

          return true;
        });
      } else {
        this.setState({
          open: true,
          message: "That folder doesn't exist.",
        });
        console.error("Folder doesn't exist.");
      }
    });
  }

  render() {
    const loadingOrGrid = (
      <Editor
        rows={this.rows()}
        columns={this.columns()}
        setVisibleRows={this.setVisibleRows}
        bulkUpdate={this.bulkUpdate}
      />
    );

    return (
      <div>
        <TopBar
          loadDirectory={this.reloadWithFilter}
          directory={this.state.directory}
          filter={this.state.filterString}
        />
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
            <>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={this.handleClose}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </>
          }
        />
      </div>
    );
  }
}

export default App;
