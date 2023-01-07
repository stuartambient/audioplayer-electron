const Row = ({ data, index, style }) => {
  return (
    <a
      href={data[index].file}
      id={data[index]._id}
      style={style}
      key={data[index]._id}
      className="file-item"
    >
      {data[index].artist}🔥{data[index].album}🔥{data[index].title}
    </a>
  );
};

export default Row;
