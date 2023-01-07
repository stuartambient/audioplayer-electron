import { v4 as uuidv4 } from "uuid";
const getKey = () => uuidv4();
const FilesList = files => {
  files.map((file, index) => {
    return (
      <div
        key={getKey()}
        id={`${file.afid}--file-div`}
        className={
          `${active}--item-div` === `${file.afid}--item-div`
            ? "item active"
            : "item"
        }
        ref={files.length === index + 1 ? lastItemElement : scrollToView}
      >
        <a
          href={item.afid}
          id={item.afid}
          val={index}
          onClick={e =>
            onClick(e, item.artist, item.title, item.album, item.picture)
          }
        >
          Artist: {item.artist ? item.artist : "not available"}
          <br></br>
          Title: {item.title ? item.title : "not available"}
          <br></br>
          Album: {item.album ? item.album : "not available"}>
        </a>
      </div>
    );
  });
};

export { FilesList };
