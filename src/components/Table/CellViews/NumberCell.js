import { isDefined } from "../../../utils/utils";

export const NumberCell = (column) =>
  isDefined(column.value) ? Number(column.value) : "";

NumberCell.userSelectable = false;
