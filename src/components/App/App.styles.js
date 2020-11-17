import styled from "styled-components";

export const Styles = styled.div`
  height: 100%;
  padding: ${(props) => (props.fullScreen ? "0" : "0")};
  min-height: 500px;
  box-sizing: border-box;

  /* .grid {
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
  } */

  .grid {
    flex: 1;
    box-shadow: 0 0 0 1px #ccc inset;
  }

  .grid__item {
    display: flex;
    padding: 10px;
    height: 100px;
    justify-content: space-between;
    box-sizing: border-box;
    box-shadow: -0.5px -0.5px 0 0.5px #ccc;
  }

  .checkbox {
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

  .container {
    padding: 2em;
    width: 90%;
    height: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .antdTable {
    width: auto;
  }

  .app-loader {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;
