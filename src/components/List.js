import React, {useState, useEffect} from "react";
import TitleBar from "./TitleBar"
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    faBars,
    faMinusCircle,
    faAngleDoubleRight,
} from '@fortawesome/free-solid-svg-icons' 

export default function List({title, colour, rows, addRow, deleteRow, updateRowNumber}){


    return (
        <div class="list" style={{backgroundColor: colour, color: colour}}>
            <TitleBar title={title}/>

            <div class="listRowContainer">
                <ol>
                    {rows.map((val, index) => 
                        <li key={val}>
                            <ListRow content={val} rowNumber={index + 1} colour={colour} deleteRow={deleteRow} updateRowNumber={updateRowNumber}/>
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


function ListRow({colour, content, rowNumber, deleteRow, updateRowNumber}) {

    const [inputNum, setInputNum] = useState(rowNumber);

    const handleKeyDown = (e) => {
        if (e.key == "Enter") {
            updateRowNumber(rowNumber - 1, inputNum - 1);
        }
    }

    const handleBlur = () => {
        updateRowNumber(rowNumber - 1, inputNum - 1);
    }

    useEffect(() => setInputNum(rowNumber), [rowNumber]);

    return (
        <div class="listRow">
            <div class="listNumber">
                <input style={{color: colour}} value={inputNum} onChange={(e) => setInputNum(e.target.value)} onKeyDown={handleKeyDown} onBlur={handleBlur} type="text"/>
            </div>
            <div class="listEntry">
                <FontAwesomeIcon style={{cursor: "grab"}} icon={faBars}/>
                <span style={{flexGrow: 1, marginLeft: "1em"}}> {content} </span>
                <FontAwesomeIcon onClick={() => deleteRow(rowNumber - 1)} style={{cursor: "pointer"}} color="grey" icon={faMinusCircle}/>
            </div>
            <div class="transferButton">
                <FontAwesomeIcon icon={faAngleDoubleRight} />
            </div>
        </div>
    )
}