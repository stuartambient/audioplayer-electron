'use strict';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AgGridReact } from 'ag-grid-react';
import DaysFrostRenderer from './daysFrostRenderer.jsx';

/*
 * It's unlikely you'll use functions that create and manipulate DOM elements like this in an React application, but it
 * demonstrates what is at least possible, and may be preferable in certain use cases
 */
const createImageSpan = (imageMultiplier, image) => {
  const resultElement = document.createElement('span');
  for (let i = 0; i < imageMultiplier; i++) {
    const imageElement = document.createElement('img');
    imageElement.src = 'https://www.ag-grid.com/example-assets/weather/' + image;
    resultElement.appendChild(imageElement);
  }
  return resultElement;
};

// This is a plain JS (not React) component
class DeltaIndicator {
  init(params) {
    const element = document.createElement('span');
    const imageElement = document.createElement('img');
    if (params.value > 15) {
      imageElement.src = 'https://www.ag-grid.com/example-assets/weather/fire-plus.png';
    } else {
      imageElement.src = 'https://www.ag-grid.com/example-assets/weather/fire-minus.png';
    }
    element.appendChild(imageElement);
    element.appendChild(document.createTextNode(params.value));
    this.eGui = element;
  }
  getGui() {
    return this.eGui;
  }
}

// This is a plain JS (not React) component
class DaysSunshineRenderer {
  init(params) {
    const daysSunshine = params.value / 24;
    this.eGui = createImageSpan(daysSunshine, params.rendererImage);
  }
  getGui() {
    return this.eGui;
  }
}

// This is a plain JS (not React) component
class RainPerTenMmRenderer {
  init(params) {
    const rainPerTenMm = params.value / 10;
    this.eGui = createImageSpan(rainPerTenMm, params.rendererImage);
  }
  getGui() {
    return this.eGui;
  }
}

const GridExample = () => {
  const [rowData, setRowData] = useState();

  const [columnDefs] = useState([
    {
      headerName: 'Month',
      field: 'Month',
      width: 75,
      cellStyle: { color: 'darkred' }
    },
    {
      headerName: 'Max Temp (\u02DAC)',
      field: 'Max temp (C)',
      width: 120,
      cellRenderer: DeltaIndicator
    },
    {
      headerName: 'Min Temp (\u02DAC)',
      field: 'Min temp (C)',
      width: 120,
      cellRenderer: DeltaIndicator
    },
    {
      headerName: 'Days of Air Frost',
      field: 'Days of air frost (days)',
      width: 233,
      cellRenderer: DaysFrostRenderer,
      cellRendererParams: { rendererImage: 'frost.png' }
    },
    {
      headerName: 'Days Sunshine',
      field: 'Sunshine (hours)',
      width: 190,
      cellRenderer: DaysSunshineRenderer,
      cellRendererParams: { rendererImage: 'sun.png' }
    },
    {
      headerName: 'Rainfall (10mm)',
      field: 'Rainfall (mm)',
      width: 180,
      cellRenderer: RainPerTenMmRenderer,
      cellRendererParams: { rendererImage: 'rain.png' }
    }
  ]);

  const gridRef = useRef(null);

  const onGridReady = () => {
    fetch('https://www.ag-grid.com/example-assets/weather-se-england.json')
      .then((resp) => resp.json())
      .then((data) => setRowData(data));
  };

  /**
   * Updates the Days of Air Frost column - adjusts the value which in turn will demonstrate the Component refresh functionality
   * After a data update, cellRenderer Components.refresh method will be called to re-render the altered Cells
   */
  const frostierYear = () => {
    const extraDaysFrost = Math.floor(Math.random() * 2) + 1;

    // iterate over the rows and make each "days of air frost"
    gridRef.current.api.forEachNode((rowNode) => {
      rowNode.setDataValue(
        'Days of air frost (days)',
        rowNode.data['Days of air frost (days)'] + extraDaysFrost
      );
    });
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div className="example-wrapper">
        <div style={{ marginBottom: '5px' }}>
          <input
            type="button"
            value="Frostier Year"
            onClick={() => frostierYear(Math.floor(Math.random() * 2) + 1)}
          />
        </div>

        <div
          id="myGrid"
          style={{
            height: '100%',
            width: '100%'
          }}
          className="ag-theme-alpine"
        >
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={{
              editable: true,
              sortable: true,
              flex: 1,
              minWidth: 100,
              filter: true,
              resizable: true
            }}
            onGridReady={onGridReady}
          />
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<GridExample />);
