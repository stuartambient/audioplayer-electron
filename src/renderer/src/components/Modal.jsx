import '../style/Modal.css';

const Modal = ({ fields, openModal, closeModal, isModalOpen, onChange }) => {
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
                    defaultChecked={field.defaultChecked}
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
