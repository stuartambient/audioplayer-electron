import { useState, useEffect } from 'react';

function EditForm({ onUpdate, selectedRowData, nodesSelected }) {
  const [formData, setFormData] = useState({
    year: '',
    title: '',
    artist: '',
    album: '',
    genre: ''
  });

  // Populate form data when selectedRowData changes
  useEffect(() => {
    if (nodesSelected && nodesSelected.length > 0) {
      // Optionally pre-fill form with data from the first selected row as an example
      /* const { year, title, artist, album, genre } = selectedRowData[0];
      setFormData({ year, title, artist, album, genre }); */
      console.log(nodesSelected);
    }
  }, [selectedRowData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData); // Call the onUpdate function passed as a prop
    setFormData({
      year: '',
      title: '',
      artist: '',
      album: '',
      genre: ''
    }); // Reset form
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
