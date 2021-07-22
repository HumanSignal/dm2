import { FaCaretDown, FaColumns } from "react-icons/fa";
import { ErrorBox } from "../../Common/ErrorBox";
import { FieldsButton } from "../../Common/FieldsButton";
import { FiltersPane } from "../../Common/FiltersPane";
import { Icon } from "../../Common/Icon/Icon";
import { Interface } from "../../Common/Interface";
import { ExportButton, ImportButton } from "../../Common/SDKButtons";
import { ActionsButton } from "./ActionsButton";
import { GridWidthButton } from "./GridWidthButton";
import { LabelButton } from "./LabelButton";
import { LoadingPossum } from "./LoadingPossum";
import { OrderButton } from "./OrderButton";
import { RefreshButton } from "./RefreshButton";
import { ViewToggle } from "./ViewToggle";

export const instruments = {
  'view-toggle': ({ size }) => {
    return <ViewToggle size={size} />;
  },
  'columns': ({ size }) => {
    return (
      <FieldsButton
        wrapper={FieldsButton.Checkbox}
        icon={<Icon icon={FaColumns} />}
        trailingIcon={<Icon icon={FaCaretDown} />}
        title={"Fields"}
        size={size}
      />
    );
  },
  'filters': ({ size }) => {
    return <FiltersPane size={size} />;
  },
  'ordering': ({ size }) => {
    return <OrderButton size={size} />;
  },
  'grid-size': ({ size }) => {
    return <GridWidthButton size={size}/>;
  },
  'refresh': ({ size }) => {
    return <RefreshButton size={size}/>;
  },
  'loading-possum': () => {
    return <LoadingPossum/>;
  },
  'label-button': ({ size }) => {
    return <LabelButton size={size}/>;
  },
  'actions': ({ size }) => {
    return <ActionsButton size={size}/>;
  },
  'error-box': () => {
    return <ErrorBox/>;
  },
  'import-button': ({ size }) => {
    return (
      <Interface name="import">
        <ImportButton size={size}>Import</ImportButton>
      </Interface>
    );
  },
  'export-button': ({ size }) => {
    return (
      <Interface name="export">
        <ExportButton size={size}>Import</ExportButton>
      </Interface>
    );
  },
};
