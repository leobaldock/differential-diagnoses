import React from "react";

const TitleBar = ({ title, buttons, backgroundColor }) => {
  
  const style = {};
  if (backgroundColor) style.backgroundColor = backgroundColor

  return (
    <div style={style} class="titleBar">
      <h1>{title.toUpperCase()}</h1>
      <div class="buttonContainer">{buttons.map((x) => x)}</div>
    </div>
  );
};

export default TitleBar;
