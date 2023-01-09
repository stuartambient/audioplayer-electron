import ReactDOM from 'react-dom';

/* const Portal = ({ children }) => {
  const mount = document.getElementById('modal');
  const el = document.createElement('div');

  useEffect(() => {
    mount.appendChild(el);
    return () => mount.removeChild(el);
  }, [el, mount]);

  return createPortal(children, el);
}; */
const Modal = ({ coords, children }) => {
  const styles = {
    background: 'white',
    position: 'fixed',
    top: '200px',
    left: '400px',
    zIndex: '100',
    overflowY: 'scroll'
  };

  return ReactDOM.createPortal(
    <div className="modal">
      <div style={styles}>{children}</div>
    </div>,
    document.getElementById('modal')
  );
};

export default Modal;
