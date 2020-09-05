import React from "react";
import TitleBar from "./TitleBar"
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faBars} from '@fortawesome/free-solid-svg-icons' 

export default function List({title, colour}){


    return (
        <div class="list" styles={{backgroundColor: colour}}>
            <TitleBar title={title}/>

            <div class="listRowContainer">
                <ol>
                    <li><ListRow/></li>
                    <li><ListRow/></li>
                    <li><ListRow/></li>
                    <li><ListRow/></li>
                    <li><ListRow/></li>
                </ol>
            </div>
        </div>
    )
}

function ListRow(){

    return (
        <div class="listRow">
            <FontAwesomeIcon icon={faBars}/>
            <span> Sample </span>
        </div>
    )
}