import { useState, useEffect } from 'react';
import { editableColumns } from './EditableColumns';
import './styles/EditForm.css';

function EditForm({ onUpdate, nodesSelected, hiddenColumns }) {
  const initialState = editableColumns.reduce((acc, col) => {
    acc[col] = '';
    return acc;
  }, {});

  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Utility function to convert data types based on the field name
  function convertToCorrectType(key, value) {
    const numTypes = ['year', 'disc', 'discCount', 'track', 'trackCount'];
    // Add more cases as necessary for other specific fields or types
    /*   console.log('key: ', key, 'value: ', value); */
    if (numTypes.includes(key)) {
      return Number(value);
    }
    return value; // Return as is if no specific conversion is needed
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const multiRowChanges = [];
    nodesSelected.forEach((node) => {
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          const newValue = convertToCorrectType(key, formData[key]);

          const changeObj = {
            rowId: node.rowIndex,
            field: key,
            newValue,
            oldValue: node.data[key]
          };
          /*    console.log('changeObj: ', changeObj); */
          multiRowChanges.push(changeObj);
        }
      });
    });
    if (multiRowChanges.length) return onUpdate(multiRowChanges);
  };

  return (
    <form onSubmit={handleSubmit} /* style={{ gridRow: '3/4' }} */>
      {editableColumns.map((col) => {
        return !hiddenColumns.includes(col) ? (
          <div
            key={col} /* style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }} */
          >
            <label htmlFor={col} /* style={{ marginRight: '8px', whiteSpace: 'nowrap' }} */>
              {`${col} :`}
            </label>
            <input
              name={col}
              id={col}
              value={formData[col]}
              /* placeholder={col} */
              onChange={handleChange}
              style={{ flex: '1', minWidth: '0' }}
            />
          </div>
        ) : null;
      })}
      <button type="submit">Submit</button>
    </form>
  );
}

export default EditForm;
