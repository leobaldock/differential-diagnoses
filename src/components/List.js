import React from "react";
import TitleBar from "./TitleBar"
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    faBars,
    faAngleDoubleRight,
} from '@fortawesome/free-solid-svg-icons' 

export default function List({title, colour}){


    return (
        <div class="list" style={{backgroundColor: colour, color: colour}}>
            <TitleBar title={title}/>

            <div class="listRowContainer">
                <ol>
                    <li><ListRow colour={colour}/></li>
                    <li><ListRow colour={colour}/></li>
                    <li><ListRow colour={colour}/></li>
                    <li><ListRow colour={colour}/></li>
                    <li><ListRow colour={colour}/></li>
                </ol>
            </div>
        </div>
    )
}

function ListRow({colour}){

    return (
        <div class="listRow">
            <div class="listNumber">
                <input style={{color: colour}} type="text"/>
            </div>
            <div class="listEntry">
                <FontAwesomeIcon icon={faBars}/>
                <span> Sample </span>
                
            </div>
            <div class="transferButton">
                <FontAwesomeIcon icon={faAngleDoubleRight} />
            </div>
        </div>
    )
}