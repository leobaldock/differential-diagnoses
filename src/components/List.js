import React, {useState, useEffect} from "react";
import TitleBar from "./TitleBar"
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    faBars,
    faMinusCircle,
    faAngleDoubleRight,
    faAngleDoubleLeft,
    faPalette,
    faComment,
    faCommentMedical
} from '@fortawesome/free-solid-svg-icons'
import { Droppable, Draggable } from "react-beautiful-dnd";
import { SliderPicker } from "react-color";
import SnomedSearch from './SnomedSearch'; 


export default function List({title, colour, rows, addRow, deleteRow, updateRowNumber, droppableId, transfer, showNotes, disableEdits, isLeft}){
    const [paletteVisibility, setPaletteVisibility] = useState(false);
    const [listColour, setListColour] = useState(colour);
    
    const listButtons = [
        <FontAwesomeIcon
        icon={faPalette}
        size="3x"
        style={{cursor: "pointer"}}
        onClick={() => setPaletteVisibility(!paletteVisibility)}
    />
    ]

    const getListStyle = isDraggingOver => ({
        //background: isDraggingOver ? "00000040" : "transparent",
        padding: "0.5em",
      });

    const getItemStyle = (isDragging, draggableStyle) => ({
        userSelect: "none",
        padding: "0.5em",
        //background: isDragging ? "#00000010" : "transparent",
        
        //styles we need to apply on draggables
        ...draggableStyle
    });

    const testStyles = {
        default: {
            hue: {
                height: '10px',
                width: '90%',
                margin: 'auto',
            },
        },
      }

    return (
        <div className="list" style={{backgroundColor: listColour, color: listColour}}>

            <TitleBar title={title} buttons={listButtons}/>
            {paletteVisibility &&
            (
                <div style={{background: "#00000060"}}>
                <SliderPicker
                    styles = {testStyles}
                    color = {listColour}
                    onChange={(e) => {
                        setListColour(e.hex);
                        //setPaletteVisibility(false);
                    }}
                />
              </div>
            )}

            <div className="listRowContainer">
                <Droppable droppableId={droppableId}>
                {(provided, snapshot) => (
                    <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                    >
                        {rows.map((row, index) => (
                            <Draggable isDragDisabled={disableEdits} key={row.id} draggableId={row.id.toString(10)} index={index}>   
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={getItemStyle(
                                            snapshot.isDragging,
                                            provided.draggableProps.style
                                        )}
                                    >
                                        <span>
                                            <ListRow
                                                content={row.displayName}
                                                note={row.note}
                                                rowNumber={index + 1}
                                                colour={listColour}
                                                deleteRow={deleteRow}
                                                updateRowNumber={updateRowNumber}
                                                transfer={transfer}
                                                showNotes={showNotes}
                                                disableEdits={disableEdits}
                                                isLeft= {isLeft}
                                            />
                                        </span>
                                    </div>
                                )}
                            </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>

                
                {!disableEdits &&
                    (<div className="addRowButton">
                        <span onClick={addRow}> + ADD NEW DIAGNOSIS </span>
                    </div>)
                }            
            </div>
        </div>
    )
}


function ListRow({colour, note, content, rowNumber, deleteRow, updateRowNumber, transfer, showNotes, disableEdits, isLeft}) {

    const [inputNum, setInputNum] = useState(rowNumber);
    const [commentColour, setCommentColour] = useState("grey");
    const [chevronColour, setChevronColour] = useState("grey");
    const [deleteColour, setDeleteColour] = useState("grey");
    const [isNotesOpen, setNotesOpen] = useState(false);


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
        <div className="listRow">
            {!isLeft &&
                <div style={{marginRight: "1em"}}className="transferButton" onClick={() => transfer(rowNumber - 1)}>
                    <FontAwesomeIcon icon={faAngleDoubleLeft} />
                </div>
            }

            <div className="listNumber">
                <input readonly={disableEdits} style={{color: "white", background: "#00000060"}} value={inputNum} onChange={disableEdits ? () => {} : (e) => setInputNum(e.target.value)} onKeyDown={handleKeyDown} onBlur={handleBlur} type="text"/>
            </div>
            <div style={{flexGrow: 1, display: "flex", flexDirection: "column"}}>
                <div className="listEntry">
                    <FontAwesomeIcon style={{cursor: "grab"}} icon={faBars}/>
                    <span style={{flexGrow: 1, marginLeft: "1em"}}><SnomedSearch /></span>
                    <div>
                        <FontAwesomeIcon
                                onClick={() => deleteRow(rowNumber - 1)}
                                style={{cursor: "pointer", transition: "0.1s ease"}}
                                color={commentColour}
                                icon={note ? faComment : faCommentMedical}
                                onClick={() => setNotesOpen(!isNotesOpen)}
                            />
                        {!disableEdits &&
                            <FontAwesomeIcon
                                onClick={() => deleteRow(rowNumber - 1)}
                                style={{cursor: "pointer", paddingLeft:"0.5em"}}
                                color={deleteColour}
                                icon={faMinusCircle}
                                onMouseEnter={() => setDeleteColour(colour)}
                                onMouseLeave={() => setDeleteColour("grey")}
                            />
                        }
                    </div>
                </div>
                {isNotesOpen && <div className="listEntry" style={{backgroundColor: "#00000040", color: "white"}}>
                    <div style={{flexGrow: 1}}>{note}</div>
                    <FontAwesomeIcon
                        onClick={() => showNotes(rowNumber - 1)} 
                        style={{cursor: "pointer", marginRight: "0.5em"}}
                        color={commentColour}
                        icon={faComment}
                        onMouseEnter={() => setCommentColour(colour)}
                        onMouseLeave={() => setCommentColour("grey")}
                    />
                </div>}
            </div>
            {isLeft &&
                <div className="transferButton" onClick={() => transfer(rowNumber - 1)}>
                    <FontAwesomeIcon icon={faAngleDoubleRight} />
                </div>
            }
        </div>
    )
}
