import React from 'react';
import { Entity } from 'draft-js';

export default ({ block }) => {
  console.log('this gets called for all atomic components');
  console.log('data', Entity.get(block.getEntityAt(0)).getData());
  // switch over data.type here and render diff DOM depending on the type
  switch (Entity.get(block.getEntityAt(0)).getData().type) {
    case 'ACTIVITY':
      console.log('>>>> activity');
      return (
        <div>
          <h1>This will be an activity</h1>
        </div>
      )
      break;
    case 'IMAGE':
      console.log('>>>> image');
      const imgContent = Entity.get(block.getEntityAt(0)).data.src;
      return <img src={imgContent} />;
      break;
    default:
      console.log('>>>> default');
      return (
        <span>Unknown custom type</span>
      )
  }
};
