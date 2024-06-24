// Mapping of incoming object keys to the keys used by the software
const keyMappings = {
  artist: 'performers',
  genres: 'genres' // Assuming 'genres' is the correct key in the target software
};

// Function to transform incoming data
function transformData(items) {
  return items.map((item) => {
    const transformed = {
      id: item.id, // Assuming 'id' does not need transformation
      updates: {}
    };

    for (const [key, value] of Object.entries(item.updates)) {
      const newKey = keyMappings[key] || key; // Get new key from mappings or use original key
      let newValue;

      // Special handling for fields that should be arrays
      if (newKey === 'genres' && typeof value === 'string') {
        newValue = value.split(',').map((s) => s.trim()); // Split by comma and trim spaces
      } else if (newKey === 'performers' && typeof value === 'string') {
        newValue = value.split(',').map((s) => s.trim());
      } else if (newKey === 'year' && typeof value === 'string') {
        newValue = Number(value);
      } else {
        newValue = value;
      }

      transformed.updates[newKey] = newValue;
    }

    return transformed;
  });
}

// Example usage
/* const dataFromReact = [
  {
    id: "D:/music/Alan Vega - 70th Birthday Limited Edition EP Series #7 10''/01 Gavin Friday & Dave Ball - Ghostrider.mp3",
    updates: { genre: 'blues, rock, southern', track: 1, artist: 'the byrds' }
  }
]; */
const transformTags = async (update) => {
  const transformedData = transformData(update);
  console.log(transformedData);
};
/* const transformedData = transformData(dataFromReact);
console.log(transformedData); */

export default transformTags;
