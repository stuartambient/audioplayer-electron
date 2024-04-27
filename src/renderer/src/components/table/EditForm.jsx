import { useState, useEffect } from 'react';

function EditForm({ onUpdate, nodesSelected }) {
  const [formData, setFormData] = useState({
    year: '',
    title: '',
    artist: '',
    album: '',
    genre: ''
  });

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
      //console.log(node.id, node.data); // Assuming you always want to print this regardless

      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          const newValue = convertToCorrectType(key, formData[key]);
          console.log('newValue: ', newValue);
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
    <form onSubmit={handleSubmit}>
      <input name="year" value={formData.year} onChange={handleChange} placeholder="Year" />
      <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" />
      <input name="artist" value={formData.artist} onChange={handleChange} placeholder="Artist" />
      <input name="album" value={formData.album} onChange={handleChange} placeholder="Album" />
      <input name="genre" value={formData.genre} onChange={handleChange} placeholder="Genre" />
      <button type="submit">Update Selected Rows</button>
    </form>
  );
}

export default EditForm;
