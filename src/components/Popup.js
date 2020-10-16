import React from 'react';

/**
 * Component to support customisable popups. Used to confirm user intent on row
 * deletion. 
 * @param {*} title title of popup
 * @param {*} children contents of popup
 * @param {*} noCallback callback function to trigger on 'NO' button 
 * @param {*} yesCallback callback function to trigger on 'YES' button 
 */
export default function Popup({title, children, noCallback, yesCallback}) {
    return (
        <>
            <div className="popupBlur"></div>
            <div className="popupContainer">
                <div className="popup">
                    <h1>{title.toUpperCase()}</h1>
                    <div class="popupContent">
                        <div>
                            {children}
                        </div>
                    </div>
                    <div className="buttonPanel">
                        {noCallback && <button className="no" onClick={noCallback}>NO</button>}
                        {yesCallback && <button className="yes" onClick={yesCallback}>YES</button>}
                    </div>
                </div>
            </div>
        </>
    );
}