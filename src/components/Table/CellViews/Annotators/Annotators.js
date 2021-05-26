import { LsCheckAlt, LsCrossAlt } from "../../../../assets/icons";
import { useSDK } from "../../../../providers/SDKProvider";
import { Block, Elem } from "../../../../utils/bem";
import { isDefined } from "../../../../utils/utils";
import { Tooltip } from "../../../Common/Tooltip/Tooltip";
import { Userpic } from "../../../Common/Userpic/Userpic";
import "./Annotators.styl";

export const Annotators = (cell) => {
  const {value, column, original: task} = cell;
  const sdk = useSDK();
  const userList = Array.from(value);
  const renderable = userList.slice(0, 10);
  const extra = userList.length - renderable.length;

  return (
    <Block name="annotators">
      {renderable.map((item) => {
        const user = item.user ?? item;
        const {annotated, reviewed, review} = item;

        const userpicIsFaded = (isDefined(annotated) && annotated === false) || (isDefined(reviewed) && reviewed === false);

        return (
          <Elem
            key={`user-${user.id}`}
            name="item"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              sdk.invoke("userCellClick", [e, column.alias, task, user]);
            }}
          >
            <Tooltip title={user.fullName || user.email}>
              <Userpic
                user={user}
                faded={userpicIsFaded}
                badge={{
                  bottomRight: review && (
                    <Block name="badge" mod={{[review]: true}}>
                      {review === 'rejected' ? <LsCrossAlt/> : <LsCheckAlt/>}
                    </Block>
                  )
                }}
              />
            </Tooltip>
          </Elem>
        );
      })}
      {(extra > 0) && (
        <Elem name="item" onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          sdk.invoke("userCellCounterClick", [e, column.alias, task, userList]);
        }}>
          <Userpic username={`+${extra}`}/>
        </Elem>
      )}
    </Block>
  );
};

Annotators.filterable = true;
