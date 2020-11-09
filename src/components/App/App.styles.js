import styled from "styled-components";

const Styles = styled.div`
  height: 100%;
  padding: ${(props) => (props.fullScreen ? "0" : "0")};
  min-height: 500px;
  box-sizing: border-box;

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

  .selected,
  .tags {
    float: right;
  }
`;

export default Styles;
