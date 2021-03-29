import React from 'react';
import PropTypes from 'prop-types';

import {
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Tooltip,
  Card,
  Grid,
  CardContent,
  Typography,
  FormControlLabel,
  Switch,
  FormHelperText,
} from '@material-ui/core';
import { withStyles, createStyles } from '@material-ui/core/styles';

const styles = (theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
    input: {
      marginBottom: theme.spacing(1),
    },
    button: {
      marginBottom: theme.spacing(1),
    },
    card: {
      height: '100%',
    },
    cardContent: {
      padding: theme.spacing(1, 1.5),
    },
    cardTitle: {
      fontSize: '13px',
      fontWeight: 'bold',
      opacity: '0.7',
    },
    cardHelp: {
      fontSize: '12px',
    },
  });

class Actions extends React.Component {
  constructor(props: {
    columns: string[];
    bulkUpdate: (attribute: string, value: string, emptyOnly: boolean) => void;
  }) {
    super(props);

    this.columnRef = React.createRef();
    this.valueRef = React.createRef();
    this.emptyOnlyRef = React.createRef();

    this.bulkUpdate = this.bulkUpdate.bind(this);
  }

  bulkUpdate() {
    if (this.columnRef.current.value !== '') {
      this.props.bulkUpdate(
        this.columnRef.current.value,
        this.valueRef.current.value,
        this.emptyOnlyRef.current.checked
      );
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <Grid container spacing={2} direction="row" justify="flex-start">
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent className={classes.cardContent}>
              <Typography
                className={classes.cardTitle}
                color="textSecondary"
                gutterBottom
              >
                BULK UPDATE
              </Typography>
              <form>
                <InputLabel id="column-select-label">Column</InputLabel>
                <Select
                  labelId="column-select-label"
                  id="column-select"
                  label="Column"
                  inputRef={this.columnRef}
                  initialValue=""
                  className={classes.input}
                  fullWidth
                  onChange={this.handleChange}
                >
                  <MenuItem value="" disabled>
                    Column
                  </MenuItem>
                  {this.props.columns.map((column: { field: string }) => (
                    <MenuItem key={column.field} value={column.field}>
                      {column.field}
                    </MenuItem>
                  ))}
                </Select>
                <TextField
                  id="outlined-basic"
                  label="Value"
                  inputRef={this.valueRef}
                  variant="outlined"
                  fullWidth
                />
                <FormControlLabel
                  className={classes.input}
                  control={
                    <Switch name="checkedA" inputRef={this.emptyOnlyRef} />
                  }
                  label="Update only empty"
                />
                <FormHelperText>
                  If on, files that already have a value wont be updated
                </FormHelperText>
                <br />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.bulkUpdate}
                  className={classes.button}
                >
                  Apply
                </Button>
                <Tooltip
                  title="Find and replace isn't currently implemented. You can use
                  `sed -i 's/original/new/g' *.md` to get most of the way there."
                  aria-label="add"
                >
                  <Button className={classes.button}>Find & Replace</Button>
                </Tooltip>
              </form>
              <Typography
                className={classes.cardHelp}
                color="textSecondary"
                gutterBottom
              >
                Select a column and it&apos;s value and all currently visible
                rows will be updated.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }
}

Actions.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.string).isRequired,
  bulkUpdate: PropTypes.func.isRequired,
  classes: PropTypes.shape({
    button: PropTypes.string,
    card: PropTypes.string,
    cardContent: PropTypes.string,
    cardTitle: PropTypes.string,
    input: PropTypes.string,
    cardHelp: PropTypes.string,
  }).isRequired,
};

export default withStyles(styles, { withTheme: true })(Actions);
