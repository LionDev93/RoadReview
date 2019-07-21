import React from 'react';
import Question from './Question';
import '../css/Input.css';
import Input from './Input';

const TriviaQuestion = ({ numbers, question, handleTextInput, value1, value2, value3, value4, value5, validator }) => {
    let text = [<div key={1}>תשובה נכונה:</div>, <div key={2}>תשובות לא נכונות:</div>];

    return (
        <div style={{ marginTop: '20px' }}>
            <Question question={question} />
            <Input
                number={numbers[0]} handleTextInput={(e, number) => handleTextInput(number, e)}
                placeholder='הנכס את השאלה' value={value1}
            />

            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '20px',
                marginRight: '35px',
                marginLeft: '8px'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: '1'
                }}>
                    <Input key={1} number={numbers[1]} handleTextInput={(e, number) => handleTextInput(number, e)}
                        placeholder='הכנס כאן תשובה נכונה' value={value2} />

                    <Input key={2} number={numbers[2]} handleTextInput={(e, number) => handleTextInput(number, e)}
                        placeholder='הכנס כאן תשובה לא נכונה' value={value3} />

                    <Input key={3} number={numbers[3]} handleTextInput={(e, number) => handleTextInput(number, e)}
                        placeholder='הכנס כאן תשובה לא נכונה' value={value4} />

                    <Input key={4} number={numbers[4]} handleTextInput={(e, number) => handleTextInput(number, e)}
                        placeholder='הכנס כאן תשובה לא נכונה' value={value5} />
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    fontSize: '17px',
                    justifyContent: 'space-between',
                    height: '65px',
                    marginTop: '15px',
                    marginLeft: '10px'
                }}> {text} </div>
            </div>
        </div>
    )
}

export default TriviaQuestion;