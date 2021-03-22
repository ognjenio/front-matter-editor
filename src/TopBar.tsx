import React from 'react';
import { createStyles, fade, WithStyles, withStyles } from "@material-ui/core/styles";
import { AppBar, Toolbar, Typography, InputBase } from '@material-ui/core';
import FolderIcon from '@material-ui/icons/Folder';

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

class TopBar extends React.Component<{}, {directory: string}> {
  [x: string]: React.RefObject<unknown>;
  constructor(props: {} | Readonly<{loadDirectory: (string)}>){
    super(props);

    this.state = {
      directory: "/home/regac/test-vault/"
    }

    this.directoryInput = React.createRef();

    const zis = this;
    var ipcRenderer = require('electron').ipcRenderer;
    ipcRenderer.on('home-directory', function (event,store) {
      zis.setState({directory: store}, () => {
        zis.directoryInput.current.value = zis.state.directory;
      })
    });

    this.setDirectory = this.setDirectory.bind(this);
  }
  setDirectory(state: Event) {
    if (state.keyCode == 13) {
      this.props.loadDirectory(this.state.directory)
    } else {
      var d = state.target.value;
      if (d[d.length - 1] != "/"){
        d = d + '/'
      }
      this.setState({directory: d});
    }
  }

  render(){
    const { classes } = this.props;

    return (
      <div className={classes.root}>
      <AppBar position="static">
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
              inputProps={{ 'aria-label': 'search' }}
              onKeyUp={this.setDirectory}
              inputRef={this.directoryInput}
              defaultValue={this.state.directory}
            />
          </div>
        </Toolbar>
      </AppBar>
    </div>

    )
  }
}

export default withStyles(styles, { withTheme: true })(TopBar);
