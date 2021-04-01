import { inject } from "mobx-react";
import { FaSync } from "react-icons/fa";
import { Button } from "../../Common/Button/Button";
import { Space } from "../../Common/Space/Space";

const injector = inject(({store}) => {
  return {
    store,
    needsDataFetch: store.needsDataFetch,
    projectFetch: store.projectFetch,
  };
});

export const RefreshButton = injector(({store, needsDataFetch, projectFetch, size}) => {
  return (
    <Space size={size}>
      <Button
        size={size}
        look={needsDataFetch && 'primary'}
        icon={<FaSync/>}
        waiting={projectFetch}
        onClick={async () => {
          await store.fetchProject({force: true, interaction: 'refresh'});
          await store.currentView?.reload();
        }}
      />
      {needsDataFetch && "Update available"}
    </Space>
  );
});
