import React from 'react';
import '../css/Input.css';

const Input = ({ number, handleTextInput, placeholder = '', value = '' }) => {

    return (
        <div className='ui small input' style={{ display: 'flex', width: '95%' }}>
            <input type="text" id='input' value={value}
                onChange={(e) => handleTextInput(number, e)}
                placeholder={placeholder} dir="rtl" />
        </div>
    )

}

export default Input;