import React, { useState } from 'react';
import FilerobotImageEditor, {
  TABS,
  TOOLS,
} from 'react-filerobot-image-editor';

export default function FzEditorSkinPicture() {
  const [isImgEditorShown, setIsImgEditorShown] = useState(false);

  const openImgEditor = () => {
    setIsImgEditorShown(true);
  };

  const closeImgEditor = () => {
    setIsImgEditorShown(false);
  };

  return (
    <div>
      <button onClick={openImgEditor}>Open Filerobot image editor</button>
    </div>
  );
}