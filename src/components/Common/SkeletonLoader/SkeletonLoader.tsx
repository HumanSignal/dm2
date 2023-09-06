import React from 'react';
import './SkeletonLoader.styl';
import { Block, Elem } from '../../../utils/bem';

export const SkeletonLoader = () => {

  return (
    <Block name="skeletonLoader">
      <Elem name='title'></Elem>
      <Elem name='mainValue'></Elem>
      <Elem name='additionalData'></Elem>
    </Block>
  );
};
