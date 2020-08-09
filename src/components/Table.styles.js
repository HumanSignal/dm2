import styled from 'styled-components';

const Styles = styled.div`
  padding-top: 2rem;

  /*** scrollable table with sticky header ***/
  height: ${props => props.height || '100%'};

  & > div,
  .ant-tabs {
    height: 100%;
  }

  .ant-tabs-content {
    height: calc(100% - 56px);
  }

  .ant-tabs-tabpane {
    height: 100%;
  }

  .table-container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  table {
    /* hack to make table scrollable and don't break table layout */
    display: inline-block;
    overflow: auto;

    th {
      position: sticky;
      top: 0;
      background: #fafafa;
      /* border styling for sticky header with borders collapsed doesn't work :( */
      box-shadow: 0 1px 0 #f0f0f0;
      z-index: 1;

      /* hack to make the table wide, table width 100% doesn't work */
      width: 100vw;
    }
  }

  .grid {
    display: flex;
  }

  .grid > div {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 1em;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 1em;
  }

  table {
    border-spacing: 0;
    border: none;
    margin-bottom: 1em;

    tr:hover td {
      background: #fafafa;
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid #f0f0f0;

      :not(:first-child) {
        border-left: 1px solid #f0f0f0;
      }

      vertical-align: top;

      .resizer {
        display: inline-block;
        background: blue;
        width: 10px;
        height: 100%;
        position: absolute;
        right: 0;
        top: 0;
        transform: translateX(50%);
        z-index: 1;
        ${'' /* prevents from scrolling while dragging on touch devices */}
        touch-action:none;

        &.isResizing {
          background: red;
        }
      }
    }
  }
`;

export default Styles;
