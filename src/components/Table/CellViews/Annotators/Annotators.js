import { Block, Elem } from "../../../../utils/bem";
import { Userpic } from "../../../Common/Userpic/Userpic";
import "./Annotators.styl";

export const Annotators = ({value}) => {
  const userList = Array.from(value);
  const renderable = userList.slice(0, 3);
  const extra = userList.length - renderable.length;

  return (
    <Block name="annotators">
      {renderable.map(user => (
        <Elem key={`user-${user.id}`} name="item">
          <Userpic user={user}/>
        </Elem>
      ))}
      {(extra > 0) && (
        <Elem name="item">
          <Userpic username={`+${extra}`}/>
        </Elem>
      )}
    </Block>
  );
};

Annotators.filterable = false;
