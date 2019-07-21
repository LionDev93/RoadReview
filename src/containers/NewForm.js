import React, { Component } from 'react';

import gcp_config from '../GCP_configs';
import SurveyQuestions from '../components/SurveyQuestions';
import ErrorModal from '../components/ErrorModal';
import fetchStream from 'fetch-readablestream';
import { Redirect } from "react-router-dom";
class NewForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      setNewFields: this.setNewFields.bind(this),
      answers: this.setNewFields(this.props.post),
      handleValidate: this.handleValidate.bind(this),
      showModal: false,
      errorMsg: '',
      childWasSaved: false,
      parentId: ''
    }; // <- set up react state
  }

  static defaultProps = {
    constants: {
      numericFields: ['difficulty', 'score'],
      textFields: ['place', 'story'],
      arrayFields: ['labels', 'question_images', 'coords', 'story_images', 'parents'],
      checkFields: ['tourists_relevancy', 'night_item', 'see_item']
    },
  }

  handleValidate() {
    if (this.props.validator.allValid()) {
      return true;
    } else {
      this.props.validator.showMessages();
      this.forceUpdate();

      return false;
    }
  }

  setNewFields() {
    const { numericFields, textFields, arrayFields, checkFields } = this.props.constants;

    let copy = {};
    copy.writer_username = this.props.user;

    for (let i = 1; i < 3; i++) {
      copy = this.setTrivia(i, copy);
    }

    for (let i in numericFields)
      copy[numericFields[i]] = null;
    for (let i in textFields)
      copy[textFields[i]] = '';
    for (let i in arrayFields)
      copy[arrayFields[i]] = [];
    for (let i in checkFields)
      copy[checkFields[i]] = null;

    return copy;
  }

  setTrivia = (triviaNum, change) => {
    let trivia = this.getTriviaByNum(triviaNum);

    change[trivia] = {
      question: undefined,
      right_answer: undefined,
      wrong_answer1: undefined,
      wrong_answer2: undefined,
      wrong_answer3: undefined,
    }
    return change;
  }

  isEmpty = (data) => {
    const { numericFields, textFields, arrayFields, checkFields } = this.props.constants;

    for (let prop in data) {
      if (((numericFields.indexOf(prop) !== -1) || (checkFields.indexOf(prop) !== -1))
        && (data[prop] !== null))
        return false;
      else if ((textFields.indexOf(prop) !== -1) && (data[prop] !== ''))
        return false;
      else if ((arrayFields.indexOf(prop) !== -1) && (data[prop].length !== 0))
        return false;
    }

    for (let prop in data['trivia1']) {
      if (data.trivia1[prop] !== undefined)
        return false;
    }

    return true;
  }

  getTriviaByNum = (num) => {
    let trivia;
    switch (num) {
      case 1:
        trivia = 'trivia1';
        break;
      case 2:
        trivia = 'trivia2';
        break;
      default:
        return null;
    }
    return trivia;
  }


  addToAnswer = (answers) => {
    console.log('new form', answers);
    this.setState({ answers: answers });
  }


  // ---> 1. GCP <---
  //Submit
  addAnswers = (e) => {
    if (!this.handleValidate())
      return;

    const { answers, } = this.state;
    e.preventDefault(); // <- prevent form submit from reloading the page

    document.getElementById("form").reset(); // <- clear the input

    let copy = Object.assign({}, answers);
    this.processTrivias(copy);  // <- process trivias and send to db
  }

  processTrivias = (answers) => {
    let trivias = [answers.trivia1, answers.trivia2];
    delete answers.trivia1;
    delete answers.trivia2;

    let sent = false;
    let toDB = [];
    for (var i in trivias) {

      let tr = trivias[i];
      for (var prop in tr) {

        if (tr[prop] !== undefined) {
          let newAn = Object.assign({}, answers);
          const pushIfExist = this.pushIfExist;

          newAn.question = pushIfExist(newAn.question, tr['question']);
          newAn.right_answer = pushIfExist(newAn.right_answer, tr['right_answer']);
          newAn.answers = [];
          newAn.answers = pushIfExist(newAn.answers, tr['right_answer'], true);
          newAn.answers = pushIfExist(newAn.answers, tr['wrong_answer1'], true);
          newAn.answers = pushIfExist(newAn.answers, tr['wrong_answer2'], true);
          newAn.answers = pushIfExist(newAn.answers, tr['wrong_answer3'], true);
          //newAn.assigned_user = "weberr@outlook.com";

          if (sent)
            delete newAn.datastore_id;
          toDB.push(newAn);

          sent = true;
          break;
        }
      }
    }

    if (toDB.length === 0) {
      this.updatePostInDB(answers);
    } else {
      for (let i in toDB) {
        this.updatePostInDB(toDB[i]);
      }
    }
  }

  pushIfExist = (pushThere, pushThat, isArr = false) => {
    if (pushThat !== undefined) {
      if (isArr) {
        pushThere.push(pushThat);
      } else {
        pushThere = pushThat;
      }
    } return pushThere;
  }

  readAllChunks = (readableStream) => {
    const reader = readableStream.getReader();
    const chunks = [];

    function pump() {
      return reader.read().then(({ value, done }) => {
        if (done) {
          return chunks;
        }
        chunks.push(value);
        return pump();
      });
    }

    return pump();
  }

  updatePostInDB = (data) => {
    if (this.isEmpty(data)) {
      const id = 'negative';
      this.showEl(id, () => document.getElementById(id).style.display = 'none');
    } else {
      data = this.processPlace(this.processCheck(data));

      let headers = new Headers();
      headers.set('Authorization', 'Basic ' + btoa(gcp_config.username + ":" + gcp_config.password));
      headers.set('Accept', 'application/json');
      headers.set('Content-Type', 'application/json');
      if (this.props.parentId) {
        data.parents = [parseInt(this.props.parentId)];
      }
      if (this.state.parentId.length > 0) {
        data.parents = [parseInt(this.state.parentId)];
      }
      const toDB = JSON.stringify({ item: data });
      console.log("SAVE NEW ITEM: ", toDB);

      fetch('https://roadio-master.appspot.com/v1/edit_item', {
        method: 'POST',
        headers: headers,
        body: toDB
      })
        .then(res => res.json())
        .then(res => {

          console.log('edit data', JSON.parse(toDB).item);
          if (res.status === 500) {
            this.setState({ showModal: true });
            return this.readAllChunks(res.body);
          }
          // this.props.getDataItems();
          console.log('edit item is', this.state.answers);
          this.showEl('success', () => { this.props.setNew(false) });
          if (this.props.parentId) {
            this.setState({
              childWasSaved: true
            })
          }

          this.props.insertDataItems({ ...JSON.parse(toDB).item, datastore_id: res, original_id: res })
        }
        )
        .catch(error => console.error('Error: ', error));

      //   fetchStream('https://roadio-master.appspot.com/v1/edit_item', {
      //     method: 'POST',
      //     headers: headers,
      //     body: toDB
      //   })
      //     .then(res => {


      //       console.log('res', res);

      //       if (res.status === 500) {
      //         this.setState({ showModal: true });
      //         return this.readAllChunks(res.body);
      //       }
      //       // this.props.getDataItems();
      //       console.log('edit item is', this.state.answers);
      //       this.showEl('success', () => { this.props.setNew(false) });
      //       if (this.props.parentId) {
      //         this.setState({
      //           childWasSaved: true
      //         })
      //       }
      //     })
      //     .then(chunks => {
      //       chunks && this.setState({ errorMsg: String.fromCharCode.apply(null, chunks[0]) });
      //       console.log('chunks', chunks);
      //     })
      //     .catch(error => console.error('Error: ', error));
    }
  }

  processCheck = (answers) => {
    for (let prop in answers) {
      if ((this.props.constants.checkFields.indexOf(prop) !== -1) && (answers[prop] === null))
        answers[prop] = false;
    }
    return answers;
  }

  processPlace = (answers) => {
    if (answers.place === '') {
      answers.place = null;
      delete answers.lon;
      delete answers.lat;
    }
    return answers;
  }


  showEl = (id, func = '') => {
    const current = document.getElementById(id);
    const move = this.moveToTop;
    if (current.style.display === 'none') {
      current.style.display = 'block';
      current.scrollIntoView(true);
      setTimeout(() => {
        func();
        move();  // move to top
      }, 1000);
    }
  }

  moveToTop = () => document.getElementById("top").scrollIntoView(true);

  handleCloseErrorMsg = () => {
    this.setState({ showModal: false });
  };

  render() {
    if (this.state.childWasSaved) {
      return <Redirect to={"/"} />
    }
    return (
      <div>
        <SurveyQuestions
          answers={this.state.answers}
          placesList={this.props.placesList}
          changed={this.state.changedForMap}
          changeToFalse={this.changeToFalse}
          addToAnswer={this.addToAnswer}
          post={this.props.post}
          data={this.props.data}
          validator={this.props.validator}
          isNewForm={true}
          changeParentId={(number, e) => {
            console.log(e.target.value);
            this.setState({ parentId: e.target.value });
          }}
          parentId={this.state.parentId}
        />
        <ErrorModal
          text={this.state.errorMsg}
          showModal={this.state.showModal}
          handleCloseModal={this.handleCloseErrorMsg}
        />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <button className={'ui labeled icon violet basic button '}
            style={{ margin: '30px' }}
            onClick={() => {
              this.props.setNew(false);
              this.moveToTop();
            }}>
            <i className="arrow left icon"></i>
            Cancel
            </button>
          <button type={"button"} className='ui right labeled icon violet basic button'
            style={{ margin: '30px' }}
            onClick={(e) => { this.addAnswers(e) }}>
            Save
              <i className="arrow right icon"></i>
          </button>
        </div>
      </div>
    )
  }
}

export default NewForm;