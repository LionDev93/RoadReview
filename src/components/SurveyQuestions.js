import React from 'react';

import Radio from './Radio';
import TextArea from './TextArea';
import SmallMessage from './SmallMessage';
import TriviaQuestion from './TriviaQuestion';
import Question from './Question';
import ImgUploader from '../containers/ImgUploader';
import MapContainer from './MapContainer';
import Checkbox from './Checkbox';

import '../css/Segment.css';
import { bool } from 'prop-types';

const SurveyQuestions = (props) => {

    const pr = {
        questions: {
            PLACE: 'מיקום קשור',
            TITLE: 'כותרת שאלה / תגיות',
            PRE_IMG: 'תמונה בזמן שאלה',
            POST_IMG: 'תמונה בזמן תשובה',
            DIFFICULTY: 'רמת קושי שאלה',
            INTERESTING: 'איכות שאלה',
            EDIT_TEXT: 'סיפור קצר משלים',
            TRIVIA1: 'שאלת טריוויה',
            TRIVIA2: '#2 שאלת טריוויה',
            TOURISTS_REL: 'כמה רלוונטי לתיירים',
            NIGHT_ITEM: "האם מתאים בחושך",
            SEE_ITEM: 'האם צריך לראות בזמן אמת',
        },
    }

    //Save answer in the state
    const handleAnswer = (question, e) => {
        let result = e.target.value;

        const numericFields = ['difficulty', 'score'];
        if (numericFields.indexOf(question) !== -1) {
            result = parseInt(result, 10);
        }

        answers[question] = result;
        props.addToAnswer(answers);
    }

    const handleAnswerArray = (question, element) => {
        let size = answers[question].length;
        if (size === 0)
            size++;
        answers[question][size - 1] = element;
        props.addToAnswer(answers);
    }


    const getTriviaByNum = (num) => {
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

    const handleAnswerTrivia = (triviaNum, question, e) => {
        let trivia = getTriviaByNum(triviaNum);
        answers[trivia][question] = e.target.value;
        props.addToAnswer(answers);
    }

    const handleAnswerPlace = (currentPlace) => {
        answers.place = currentPlace.place_name;
        answers.lon = currentPlace.lon;
        answers.lat = currentPlace.lat;
        props.addToAnswer(answers);
    }

    const handleCheck = (question, e) => {
        answers[question] = e.target.checked;
        props.addToAnswer(answers);
    }


    const questions = pr.questions;
    let answers = props.answers;
    let validator = props.validator;
    
    return (
        <div className="Survey">
            <form id='form'>

                <TriviaQuestion
                    question={questions.TRIVIA1}
                    tooltip={'answer is..'}
                    numbers={['question', 'right_answer', 'wrong_answer1', 'wrong_answer2', 'wrong_answer3']}
                    handleTextInput={(e, number) => handleAnswerTrivia(1, number, e)}
                    value1={answers.trivia1.question}
                    value2={answers.trivia1.right_answer}
                    value3={answers.trivia1.wrong_answer1}
                    value4={answers.trivia1.wrong_answer2}
                    value5={answers.trivia1.wrong_answer3}
                />

                <TextArea
                    question={questions.EDIT_TEXT}
                    handleTextInput={(e) => handleAnswer('story', e)}
                    value={answers.story}
                    rows={'10'}
                />
                                
                <Question question={questions.PLACE} />
                <MapContainer
                    handleAnswer={(place) => handleAnswerPlace(place)}
                    placesList={props.placesList}
                    answer={answers.place}
                    changed={props.changed}
                    changeToFalse={props.changeToFalse}
                    post={props.post}
                    data={props.data}
                />
                {validator.message('google', answers.place && answers.lat && answers.lon , 'google')}
               
                <ImgUploader
                    question={questions.PRE_IMG}
                    handleImgLoad={(newImg) => handleAnswerArray('question_images', newImg)}
                    answer={answers.question_images[answers.question_images.length - 1]} // to remember image 
                />
                
                <ImgUploader
                    question={questions.POST_IMG}
                    handleImgLoad={(newImg) => handleAnswerArray('story_images', newImg)}
                    answer={answers.story_images[answers.story_images.length - 1]} // to remember image 
                />
                
                <TextArea
                    question={questions.TITLE}
                    handleTextInput={(e) => handleAnswerArray('labels', e.target.value)}
                    value={answers.labels[answers.labels.length - 1]}
                />                

                <Radio
                    question={questions.DIFFICULTY}
                    handleOptionChange={(e) => handleAnswer('difficulty', e)}
                    answer={answers.difficulty}
                />

                <Radio
                    question={questions.INTERESTING}
                    handleOptionChange={(e) => handleAnswer('score', e)}
                    answer={answers.score}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 30px', marginTop: "40px" }}>
                    <Checkbox question={questions.TOURISTS_REL} checked={answers.tourists_relevancy}
                        handleCheck={(e) => handleCheck('tourists_relevancy', e)} />                        

                    <Checkbox question={questions.NIGHT_ITEM} checked={answers.night_item}
                        handleCheck={(e) => handleCheck('night_item', e)} />

                    <Checkbox question={questions.SEE_ITEM} checked={answers.see_item}
                        handleCheck={(e) => handleCheck('see_item', e)} />
                </div>

                <SmallMessage name='success' text1='הטופס הושלם'
                    text2='התשובות נשמרו' />
                <SmallMessage name='negative' text1='הטופס לא נשלח'
                    text2='שים לב - חובה למלא את דירוג הקשר למיקום' />
            </form>
        </div>)

}

export default SurveyQuestions;