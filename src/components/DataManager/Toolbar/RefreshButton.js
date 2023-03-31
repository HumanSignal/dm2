import { inject } from "mobx-react";
import { LsRefresh, LsRefresh2 } from "../../../assets/icons";
import { FF_LOPS_E_3, isFF } from "../../../utils/feature-flags";
import { Button } from "../../Common/Button/Button";

const isDatasetsFF = isFF(FF_LOPS_E_3);

const injector = inject(({ store }) => {
  return {
    store,
    needsDataFetch: store.needsDataFetch,
    projectFetch: store.projectFetch,
  };
});

export const RefreshButton = injector(({ store, needsDataFetch, projectFetch, size, style, ...rest }) => {
  return (
    <Button
      size={size}
      look={needsDataFetch && 'primary'}
      waiting={projectFetch}
      onClick={async () => {
        await store.fetchProject({ force: true, interaction: 'refresh' });
        await store.currentView?.reload();
      }}
      style={{
        ...(style ?? {}),
        minWidth: 0,
        padding: 0,
        width: isDatasetsFF ? 40 : 32,
      }}
      {...rest}
    >
      {isDatasetsFF ? <LsRefresh2 /> : <LsRefresh style={{ width: 20, height: 20 }} />}
    </Button>
  );
});
