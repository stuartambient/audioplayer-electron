import { useState, useEffect } from 'react';
import EditForm from './EditForm';
import Modal from '../Modal';
import { openChildWindow } from '../ChildWindows/openChildWindow';
import TableAudioControls from './TableAudioControls';
import './styles/CustomToolPanel.css';

const CustomToolPanel = ({
  onChange,
  onClick,
  /* onUpdate, */
  isPanelVisible,
  togglePanelVisibility,
  /*   nodesSelected, */
  hiddenColumns
}) => {
  const [onForm, setOnForm] = useState(false);
  /*  const [isPanelVisible, setIsPanelVisible] = useState(true); */
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  /*   const togglePanelVisibility = () => {
    setIsPanelVisible(!isPanelVisible);
  }; */

  const fields = [
    { name: 'audiotrack', label: 'audiotrack', defaultChecked: true },
    { name: 'title', label: 'title', defaultChecked: true },
    { name: 'performers', label: 'performers', defaultChecked: true },
    { name: 'album', label: 'album', defaultChecked: true },
    { name: 'genres', label: 'genres', defaultChecked: true },
    { name: 'like', label: 'like', defaultChecked: true },
    { name: 'error', label: 'error', defaultChecked: true },
    { name: 'albumArtists', label: 'albumArtists', defaultChecked: true },
    { name: 'audioBitrate', label: 'audioBitrate', defaultChecked: true },
    { name: 'audioSamplerate', label: 'audioSamplerate', defaultChecked: true },
    { name: 'codecs', label: 'codecs', defaultChecked: true },
    { name: 'bpm', label: 'bpm', defaultChecked: true },
    { name: 'composers', label: 'composers', defaultChecked: true },
    { name: 'conductor', label: 'conductor', defaultChecked: true },
    { name: 'copyright', label: 'copyright', defaultChecked: true },
    { name: 'comment', label: 'comment', defaultChecked: true },
    { name: 'disc', label: 'disc', defaultChecked: true },
    { name: 'discCount', label: 'discCount', defaultChecked: true },
    { name: 'description', label: 'description', defaultChecked: true },
    { name: 'duration', label: 'duration', defaultChecked: true },
    { name: 'isCompilation', label: 'isCompilation', defaultChecked: true },
    { name: 'isrc', label: 'isrc', defaultChecked: true },
    { name: 'lyrics', label: 'lyrics', defaultChecked: true },
    { name: 'performersRole', label: 'performersRole', defaultChecked: true },
    { name: 'pictures', label: 'pictures', defaultChecked: true },
    { name: 'publisher', label: 'publisher', defaultChecked: true },
    { name: 'remixedBy', label: 'remixedBy', defaultChecked: true },
    { name: 'replayGainAlbumGain', label: 'replayGainAlbumGain', defaultChecked: false },
    { name: 'replayGainAlbumPeak', label: 'replayGainAlbumPeak', defaultChecked: false },
    { name: 'replayGainTrackGain', label: 'replayGainTrackGain', defaultChecked: false },
    { name: 'replayGainTrackPeak', label: 'replayGainTrackPeak', defaultChecked: false },
    { name: 'track', label: 'track', defaultChecked: true },
    { name: 'trackCount', label: 'trackCount', defaultChecked: true },
    { name: 'year', label: 'year', defaultChecked: true }
  ];

  return (
    <>
      <div className="hamburger-container">
        <button className="hamburger-btn" onClick={togglePanelVisibility}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <TableAudioControls />
      </div>

      <div className={`column-panel ${isPanelVisible ? '' : 'hidden'}`}>
        <fieldset /* style={{ display: 'flex' }} */>
          <Modal
            className="modal"
            fields={fields}
            openModal={openModal}
            closeModal={closeModal}
            isModalOpen={isModalOpen}
            onChange={onChange}
            hiddenColumns={hiddenColumns}
          />

          <div>
            <button id="auto-size-all" className="auto-size-all" onClick={onClick}>
              Auto Size All
            </button>
          </div>
          <div>
            <button id="reset-window" className="reset-window" onClick={onClick}>
              Reset Window
            </button>
          </div>
          <div>
            <button id="deselect-all" className="deselect-all" onClick={onClick}>
              Deselect All
            </button>
          </div>
          <div>
            <button id="save-all" className="save-all" onClick={onClick}>
              Save all
            </button>
            <button id="cancel-all" className="cancel-all" onClick={onClick}>
              Cancel all
            </button>
          </div>
          <div>
            <button id="undo-last" className="undo-last" onClick={onClick}>
              Undo
            </button>
            <button id="redo-last" className="redo-last" onClick={onClick}>
              Redo
            </button>
            <button onClick={openModal} /* style={{ gridColumn: '1/-1' }} */>
              Column Preferences
            </button>
          </div>
        </fieldset>
        {/*      {nodesSelected.length > 0 && (
          <EditForm
            id="menu"
            className="menu hidden"
            onUpdate={onUpdate}
            nodesSelected={nodesSelected}
            hiddenColumns={hiddenColumns}
          />
        )} */}
      </div>
      {/*    <div className="edit-form">
        {nodesSelected.length > 0 && (
          <EditForm
            style={{ width: '20%' }}
            id="menu"
            className="menu hidden"
            onUpdate={onUpdate}
            nodesSelected={nodesSelected}
            hiddenColumns={hiddenColumns}
          />
        )}
      </div> */}
    </>
  );
};

export default CustomToolPanel;

/* {nodesSelected.length > 0 &&
  openChildWindow(
    'tag-form',
    'tag-batch',
    {
      width: 1200,
      parent: 'table-data',
      height: 550,
      show: false,
      resizable: true,
      preload: 'tagForm',
      sandbox: false,
      webSecurity: false,
      contextIsolation: true
    },
    ['a', 'b', 'c']
  )} */
