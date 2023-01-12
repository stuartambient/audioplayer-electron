import { useState } from 'react';
import { AiOutlineEdit, AiOutlineSave, AiOutlineCloseSquare } from 'react-icons/ai';
import '../style/TextEditor.css';

const TextEditor = ({ title, text, closeFileDetails, closeFolderDetails }) => {
  const [edit, setEdit] = useState(false);
  const [save, setSave] = useState(false);
  const [close, setClose] = useState(false);
  const handleFileMenu = (e) => {
    switch (e.currentTarget.id) {
      case 'edit': {
        setEdit(!edit);
        break;
      }
      case 'save': {
        setSave(!save);
        break;
      }
      case 'close': {
        setClose(!close);
        if (title === 'File - updates') {
          closeFileDetails(false);
        }
        if (title === 'Folder - updates') {
          closeFolderDetails(false);
        }
        break;
      }
      default:
        return;
    }
  };
  return (
    <div className="text-editor">
      <div className="text-editor--menu">
        <p>{title}</p>
        <div
          className={edit ? 'editor-btn--active' : 'editor-btn'}
          id="edit"
          onClick={handleFileMenu}
        >
          <div className="editor-btn--label">
            <AiOutlineEdit />
            Edit
          </div>
        </div>
        <div
          className={save ? 'editor-btn active' : 'editor-btn'}
          id="save"
          onClick={handleFileMenu}
        >
          <div className="editor-btn--label">
            <AiOutlineSave />
            Save
          </div>
        </div>
        <div
          className={close ? 'editor-btn active' : 'editor-btn'}
          id="close"
          onClick={handleFileMenu}
        >
          <div className="editor-btn--label">
            <AiOutlineCloseSquare />
            Close
          </div>
        </div>
      </div>
      {/*       <div className="text-editor--wrapper"> */}
      <textarea
        className={edit ? 'active-edit' : null}
        defaultValue={text}
        readOnly={edit ? false : true}
      ></textarea>
      {/*    </div> */}
    </div>
  );
};

export default TextEditor;
