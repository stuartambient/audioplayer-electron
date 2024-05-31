import { useState, useEffect } from 'react';
import { editableColumns } from './EditableColumns';
import './styles/EditForm.css';

function EditForm({ onUpdate, /* nodesSelected,  */ hiddenColumns }) {
  const initialState = editableColumns.reduce((acc, col) => {
    acc[col] = '';
    return acc;
  }, {});

  const [formData, setFormData] = useState(initialState);

  // Populate form data when selectedRowData changes
  /*   useEffect(() => {
    if (nodesSelected && nodesSelected.length > 0) {
      Optionally pre-fill form with data from the first selected row as an example
      const { year, title, artist, album, genre } = selectedRowData[0];
      setFormData({ year, title, artist, album, genre }); 
      console.log(nodesSelected);
    }
  }, [selectedRowData]); */

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Utility function to convert data types based on the field name
  function convertToCorrectType(key, value) {
    // Add more cases as necessary for other specific fields or types
    if (key === 'year') {
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
          multiRowChanges.push(changeObj);
        }
      });
    });
    if (multiRowChanges.length) return onUpdate(multiRowChanges);
  };

  return (
    <form onSubmit={handleSubmit} style={{ gridRow: '3/4' }}>
      {editableColumns.map((col) => {
        return !hiddenColumns.includes(col) ? (
          <div key={col}>
            <input
              name={col}
              id={col}
              value={formData[col]}
              placeholder={col}
              onChange={handleChange}
            />
          </div>
        ) : null;
      })}
      <button type="submit">Submit</button>
    </form>
  );
}

export default EditForm;
