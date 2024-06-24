import { useEffect, useState } from 'react';
import '../style/Modal.css';

const Modal = ({ fields, openModal, closeModal, isModalOpen, onChange, hiddenColumns }) => {
  /*   useEffect(() => {
    console.log('hidden columns: ', hiddenColumns);
  }, [hiddenColumns]); */

  return (
    <>
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <fieldset style={{ display: 'flex' /* , flexDirection: 'column' */ }}>
              {fields.map((field) => (
                <div key={field.name}>
                  <input
                    type="checkbox"
                    name={field.name}
                    id={field.name}
                    defaultChecked={!hiddenColumns.includes(field.name)}
                    onChange={onChange}
                    value={true}
                  />
                  <label htmlFor={field.name}>{field.label}</label>
                </div>
              ))}
            </fieldset>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
