import styled from 'styled-components';

const Styles = styled.div`
  padding: 1rem;

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

    thead {
      background: #fafafa;
    }

    tr {
      :hover td {
        background: #fafafa;
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid #f0f0f0;

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
