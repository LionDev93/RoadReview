import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Button } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
const styles = theme => ({
  radioGroup: {
    display: 'flex',
  },
  formControl: {
    marginTop: 20,
  },
});

const difficulty = ['1', '2', '3', '4', '5'];
class EditNewItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      question: '',
      correctAnswer: '',
      incorrectAnswer1: '',
      incorrectAnswer2: '',
      incorrectAnswer3: '',
      story: '',
      askingImg: '',
      replyImg: '',
      difficultyLevel: 1,
      qualityLevel: 1,
    };
  }

  handleInput = input => e => {
    console.log('3', input, e.target.value);
    this.setState({ [input]: e.target.value });
  };

  handleSave = () => {
    const data = this.state;
    this.props.onSave(data);
  };
  render() {
    const {
      question,
      correctAnswer,
      incorrectAnswer1,
      incorrectAnswer2,
      incorrectAnswer3,
      story,
      askingImg,
      replyImg,
      difficultyLevel,
      qualityLevel,
    } = this.state;
    const { classes } = this.props;
    return (
      <Grid container>
        <Grid item xs={12}>
          <TextField
            id="id-question"
            label="Question"
            placeholder="..."
            margin="normal"
            fullWidth
            value={question}
            onChange={this.handleInput('question')}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="id-correct-answer"
            label="Correct Answer"
            placeholder="..."
            margin="normal"
            fullWidth
            value={correctAnswer}
            onChange={this.handleInput('correctAnswer')}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="id-incorrect-answer1"
            label="Incorrect Answer1"
            placeholder="..."
            margin="normal"
            fullWidth
            value={incorrectAnswer1}
            onChange={this.handleInput('incorrectAnswer1')}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="id-incorrect-answer2"
            label="Incorrect Answer2"
            placeholder="..."
            margin="normal"
            fullWidth
            value={incorrectAnswer2}
            onChange={this.handleInput('incorrectAnswer2')}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="id-incorrect-answer3"
            label="Incorrect Answer3"
            placeholder="..."
            margin="normal"
            fullWidth
            value={incorrectAnswer3}
            onChange={this.handleInput('incorrectAnswer3')}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Story"
            placeholder="..."
            margin="normal"
            value={story}
            multiline
            rows={3}
            rowsMax={5}
            fullWidth
            onChange={this.handleInput('story')}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="id-askingImg"
            label="Picture while Asking"
            placeholder="..."
            margin="normal"
            fullWidth
            value={askingImg}
            onChange={this.handleInput('askingImg')}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="id-replyImg"
            label="Picture in reply"
            placeholder="..."
            margin="normal"
            fullWidth
            value={replyImg}
            onChange={this.handleInput('replyImg')}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">Question difficulty level</FormLabel>
            <RadioGroup
              name="Question difficult level"
              value={difficultyLevel}
              row
              onChange={this.handleInput('difficultyLevel')}
            >
              {difficulty.map((item, index) => {
                return (
                  <FormControlLabel
                    key={index}
                    label={item}
                    value={item}
                    labelPlacement="top"
                    control={<Radio color="primary" />}
                  />
                );
              })}
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">Question quality</FormLabel>
            <RadioGroup
              name="Question quality"
              value={qualityLevel}
              onChange={this.handleInput('qualityLevel')}
              row
            >
              {difficulty.map((item, index) => {
                return (
                  <FormControlLabel
                    key={index}
                    label={item}
                    value={item}
                    labelPlacement="top"
                    control={<Radio color="primary" />}
                  />
                );
              })}
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Grid
            container
            direction="row"
            spacing={3}
            justify="center"
            alignItems="center"
          >
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleSave}
              >
                Save
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                style={{ marginLeft: 10 }}
                onClick={this.props.onCancel}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(EditNewItem);
