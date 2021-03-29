import React from 'react';
import PropTypes from 'prop-types';
import { createStyles, fade, withStyles } from '@material-ui/core/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  InputBase,
  Tooltip,
} from '@material-ui/core';
import { ipcRenderer } from 'electron';
import FolderIcon from '@material-ui/icons/Folder';
import FilterIcon from '@material-ui/icons/FilterList';

const styles = (theme) =>
  createStyles({
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
      flexGrow: 1,
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      flexGrow: 1,
      // vertical padding + font size from FolderIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create('width'),
      width: 'auto',
    },
  });

class TopBar extends React.Component {
  constructor(props: {
    filter: string;
    directory: string;
    loadDirectory: (directory: string, filter: string) => void;
  }) {
    super(props);

    this.directoryInput = React.createRef();
    this.filterInput = React.createRef();

    ipcRenderer.on('home-directory', (event, store) => {
      this.directoryInput.current.value = store;
    });

    this.setDirectory = this.setDirectory.bind(this);
  }

  setDirectory(state: Event) {
    if (state.keyCode === 13) {
      this.props.loadDirectory(
        this.directoryInput.current.value,
        this.filterInput.current.value
      );
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <AppBar position="fixed">
          <Toolbar>
            <Typography className={classes.title} variant="h6" noWrap>
              Editor
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
                onKeyUp={this.setDirectory}
                inputRef={this.directoryInput}
                initialValue={this.props.directory}
              />
            </div>
            <div className={classes.search}>
              <div className={classes.FolderIcon}>
                <FilterIcon />
              </div>
              <Tooltip title="Enter a pattern for the filenames to load. Only markdown files will be loaded.">
                <InputBase
                  placeholder="Filter"
                  classes={{
                    root: classes.inputRoot,
                    input: classes.inputInput,
                  }}
                  onKeyUp={this.setDirectory}
                  inputRef={this.filterInput}
                  initialValue={this.props.filter}
                />
              </Tooltip>
            </div>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

TopBar.propTypes = {
  filter: PropTypes.string.isRequired,
  directory: PropTypes.string.isRequired,
  loadDirectory: PropTypes.func.isRequired,
  classes: PropTypes.shape({
    root: PropTypes.string,
    title: PropTypes.string,
    search: PropTypes.string,
    FolderIcon: PropTypes.string,
    inputRoot: PropTypes.string,
    inputInput: PropTypes.string,
  }).isRequired,
};

export default withStyles(styles, { withTheme: true })(TopBar);
