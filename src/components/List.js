import React from "react";
import TitleBar from "./TitleBar"
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    faBars,
    faMinusCircle,
    faAngleDoubleRight,
} from '@fortawesome/free-solid-svg-icons' 

export default function List({title, colour, rows, addRow, deleteRow}){


    return (
        <div class="list" style={{backgroundColor: colour, color: colour}}>
            <TitleBar title={title}/>

            <div class="listRowContainer">
                <ol>
                    {rows.map((name, index) => 
                        <li>
                            <ListRow name={name} index={index + 1} colour={colour} deleteRow={deleteRow}/>
                        </li>
                    )}
                </ol>
                <div class="addRowButton">
                    <span onClick={addRow}> + ADD NEW DIAGNOSIS </span>
                </div>
            
            </div>
        </div>
    )
}


function ListRow({colour, name, index, deleteRow}){

    return (
        <div class="listRow">
            <div class="listNumber">
                <input style={{color: colour}} value={index} type="text"/>
            </div>
            <div class="listEntry">
                <FontAwesomeIcon style={{cursor: "grab"}} icon={faBars}/>
                <span style={{flexGrow: 1, marginLeft: "1em"}}> {name} </span>
                <FontAwesomeIcon onClick={() => deleteRow(index - 1)} style={{cursor: "pointer"}} color="grey" icon={faMinusCircle}/>
            </div>
            <div class="transferButton">
                <FontAwesomeIcon icon={faAngleDoubleRight} />
            </div>
        </div>
    )
}