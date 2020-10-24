import React from "react";

/**
 * Cute little modular TitleBar used for the main page heading and title of
 * Lists.
 * @param {*} title the title of the titlebar
 * @param {*} showLogo an image title for the titlebar
 * @param {*} buttons an array of buttons used by this title bar
 * @param {*} backgroundColor backgroundColour of title bar 
 */
const TitleBar = ({ title, showLogo, buttons, backgroundColor }) => {
  
  const style = {};
  if (backgroundColor) style.backgroundColor = backgroundColor

  return (
    <div style={style} className="titleBar">
      {showLogo && 
        <div style={{width: "15em"}}>
          <img
            style={{maxWidth: "100%", height: "auto"}}
            src="/diagnosys_logo.png"
            alt="DiagnoSys Logo"/>
        </div>
      }
      {title && <span className="title">{title.toUpperCase()} </span>}

      
      <div className="buttonContainer">{buttons.map((x) => x)}</div>
    </div>
  );
};

export default TitleBar;
