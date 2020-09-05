import React from 'react';

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