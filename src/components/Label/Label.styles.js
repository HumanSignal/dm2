const { default: styled } = require("styled-components");

export const Styles = styled.div`
  height: 100%;
  width: 100%;

  .wrapper {
    display: flex;
    align-items: stretch;
    height: 100%;
  }

  .table {
    display: flex;
    flex: 200px 0 0;
    margin-right: 1em;
    flex-direction: column;
  }

  .label-studio {
    width: 100%;
    overflow: auto;
    box-sizing: border-box;
    padding-bottom: 50px;
  }
`;
