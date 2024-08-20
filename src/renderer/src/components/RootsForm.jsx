import React, { useState, useEffect } from 'react';
import '../style/RootsForm.css';

const RootsForm = ({ rootDirs }) => {
  const [inputs, setInputs] = useState([]);
  const [inputError, setInputError] = useState([]);

  useEffect(() => {
    if (rootDirs && rootDirs.length > 0) {
      setInputs(rootDirs);
    }
  }, [rootDirs]);

  const handleAddInput = () => {
    setInputs([...inputs, { id: null, root: '' }]);
  };

  const handleRemoveInput = (index) => {
    setInputs(inputs.filter((_, i) => i !== index));
  };

  const handleInputChange = (index, event) => {
    const regex = /^[A-Za-z]:\/[^:*?"<>|]*$/;
    /*   const dirRegex = regex.test(event.target.value); */

    const newInputs = inputs.map((input, i) => {
      if (i === index) {
        return { ...input, root: event.target.value };
      }
      return input;
    });
    /*   if (!regex.test(event.target.value)) {
      setInputError(true);
    } */
    console.log('new inputs: ', newInputs);
    setInputs(newInputs);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Implement the logic to send 'inputs' to the database here.
    console.log('Submitting:', inputs);
  };

  return (
    <form onSubmit={handleSubmit}>
      {inputs.map((input, index) => (
        <div key={index} className="input-container">
          <input
            type="text"
            className="styled-input"
            value={input.root}
            onChange={(e) => handleInputChange(index, e)}
            style={{ color: inputError ? 'black' : 'red' }}
            pattern='^[A-Za-z]:\/[^:*?"&lt;&gt;|]*$'
            title="Please enter a valid path."
          />
          <button type="button" className="delete-btn" onClick={() => handleRemoveInput(index)}>
            -
          </button>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button type="button" className="add-btn" onClick={handleAddInput}>
          +
        </button>
        <button type="submit" className="add-btn submit-btn">
          Submit
        </button>
      </div>
    </form>
  );
};

export default RootsForm;
