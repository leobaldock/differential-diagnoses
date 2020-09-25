import React from "react";
import TitleBar from "./TitleBar";
import List from "./List";
import "./Diagnoses.css";
import Popup from "./Popup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { DragDropContext } from "react-beautiful-dnd";
import { withFHIR } from "../state/fhir";
import { CircleLoader } from "react-spinners";

class DifferentialDiagnosis extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      listA: [
        // Each row/diagnosis should look something like this.
        // We'll probably add more when we get FIHR resource integrated
        // {
        //     id: "129842",
        //     snomed: {
        //        code: 1233,
        //        display: "cancer"
        //     },
        //     note: ""
        // }
      ],
      listB: [],
      deletingRow: null, // [list, index]
      loading: false,
    };

    this.id2List = {
      droppable1: "listA",
      droppable2: "listB",
    };

    this.addRow = this.addRow.bind(this);
    this.deleteRow = this.deleteRow.bind(this);
    this.updateRowNumber = this.updateRowNumber.bind(this);
    this.reorder = this.reorder.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.getList = this.getList.bind(this);
    this.move = this.move.bind(this);
    this.manualMove = this.manualMove.bind(this);
    this.saveToFHIR = this.saveToFHIR.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { FHIR } = this.props;
    const { episodeOfCare } = FHIR;
    if (
      episodeOfCare !== prevProps.FHIR.episodeOfCare &&
      episodeOfCare.diagnosis
    ) {
      /* Show loader */
      this.setState({ loading: true });

      /* The episodeOfCare was updated and contains diagnoses, load the lists with these diagnoses */
      let newListA = [];
      let newListB = [];

      /* To reduce queries, find all the conditions for this patient and then we will filter them */
      this.props.FHIR.searchResources("Condition", {
        patient: FHIR.makeRef(FHIR.patient),
      }).then((result) => {
        episodeOfCare.diagnosis.forEach((e, index) => {
          /* Find the condition in the patient's list of conditions */
          const condition = result.entry.find(
            (c) => c.fullUrl === `${FHIR.iss}/${e.condition.reference}`
          ).resource;

          let list = e.role.text == "Likely" ? newListA : newListB;
          list.splice(e.rank, 0, {
            id: index,
            note: "",
            snomed: {
              code: condition.code.coding[0].code,
              display: condition.code.coding[0].display,
            },
          });
        });

        this.setState({ listA: newListA, listB: newListB, loading: false });
      });
    }
  }

  addRow(list) {
    list.push({
      id: new Date().getTime(),
      snomed: {},
      note: "",
    });

    if (list == this.state.listA) this.setState({ listA: [...list] });
    else if (list == this.state.listB) this.setState({ listB: [...list] });
    else console.log("Unknown list");
  }

  deleteRow(list, index) {
    list.splice(index, 1);

    let newState = {
      deletingRow: null,
    };

    if (list == this.state.listA) newState.listA = list;
    else if (list == this.state.listB) newState.listB = list;
    else console.log("Unknown list");

    this.setState(newState);
  }

  updateRowNumber(from, to) {
    if (this.state.rows.length < 2) return;
    // Go to top of list
    if (to < 0) to = 0;
    // Go to bottom of list
    if (to >= this.state.rows.length) to = this.state.rows.length - 1;

    const result = this.reorder(this.state.rows, from, to);
    this.setState({
      rows: result,
    });
  }

  reorder(list, startIndex, endIndex) {
    const result = Array.from(list);
    if (list.length < 2) return result;
    // Go to top of list
    if (endIndex < 0) endIndex = 0;
    // Go to bottom of list
    if (endIndex >= list.length) endIndex = list.length - 1;

    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  getList(id) {
    return this.state[this.id2List[id]];
  }

  manualMove(sourceList, destinationList, sourceIndex, destinationIndex) {
    const sourceClone = Array.from(sourceList);
    const destClone = Array.from(destinationList);
    const [removed] = sourceClone.splice(sourceIndex, 1);

    destClone.splice(destinationIndex, 0, removed);

    let newState = {};

    if (sourceList == this.state.listA) newState.listA = sourceClone;
    else if (sourceList == this.state.listB) newState.listB = sourceClone;
    else console.log("Uknown List");

    if (destinationList == this.state.listA) newState.listA = destClone;
    else if (destinationList == this.state.listB) newState.listB = destClone;
    else console.log("Unkown List");

    this.setState(newState);
  }

  move(source, destination, droppableSource, droppableDestination) {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
  }

  onDragEnd(result) {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const list = this.getList(source.droppableId);
      const items = this.reorder(list, source.index, destination.index);

      if (list == this.state.listA) this.setState({ listA: items });
      else if (list == this.state.listB) this.setState({ listB: items });
      else console.log("Unknown list");
    } else {
      const result = this.move(
        this.getList(source.droppableId),
        this.getList(destination.droppableId),
        source,
        destination
      );

      this.setState({
        listA: result.droppable1,
        listB: result.droppable2,
      });
    }
  }

  async saveToFHIR() {
    const { FHIR } = this.props;

    const likelyDiagnoses = await this.createDiagnosisList(
      this.state.listA,
      "Likely"
    );

    const criticalDiagnoses = await this.createDiagnosisList(
      this.state.listB,
      "Critical"
    );

    const diagnosis = likelyDiagnoses.concat(criticalDiagnoses);

    const episodeOfCare = await FHIR.updateResource(
      `EpisodeOfCare/${FHIR.episodeOfCare.id}`,
      {
        resourceType: "EpisodeOfCare",
        id: FHIR.episodeOfCare.id,
        status: "active",
        patient: { reference: FHIR.makeRef(FHIR.patient) },
        diagnosis,
      }
    );

    FHIR.setEpisodeOfCare(episodeOfCare);
  }

  async createDiagnosisList(list, role) {
    const { FHIR } = this.props;
    return await Promise.all(
      list.map(async (e, index) => {
        /* Create a condition for each item in the list */
        const resource = await FHIR.createResource("Condition", {
          resourceType: "Condition",
          subject: { reference: FHIR.makeRef(FHIR.patient) },
          code: {
            coding: [
              {
                system: "http://snomed.info/sct",
                code: e.snomed.code,
                display: e.snomed.display,
              },
            ],
            text: e.snomed.display,
          },
        });

        return {
          condition: { reference: FHIR.makeRef(resource) },
          role: { text: role },
          rank: index + 1,
        };
      })
    );
  }

  renderLoading() {
    return (
      <div className="loading">
        <CircleLoader size={100} />
      </div>
    );
  }

  render() {
    const pageTitleButtons = [
      <FontAwesomeIcon
        icon={faSave}
        size="3x"
        style={{ cursor: "pointer" }}
        onClick={this.saveToFHIR}
      />,
    ];

    if (this.state.loading) {
      return this.renderLoading();
    }

    return (
      <div
        style={{ height: "100vh", display: "flex", flexDirection: "column" }}
      >
        <TitleBar title="Differential Diagnoses" buttons={pageTitleButtons} />

        <div className="listContainer">
          <DragDropContext onDragEnd={this.onDragEnd}>
            <List
              title={`Likely Diagnoses`}
              colour="#5DAD89"
              droppableId="droppable1"
              rows={this.state.listA}
              addRow={() => this.addRow(this.state.listA)}
              deleteRow={(index) =>
                this.setState({ deletingRow: [this.state.listA, index] })
              }
              updateRowNumber={(from, to) =>
                this.setState({
                  listA: this.reorder(this.state.listA, from, to),
                })
              }
              transfer={(index) =>
                this.manualMove(this.state.listA, this.state.listB, index, 0)
              }
              setSnomed={(row, newSnomed) => {
                row.snomed = newSnomed;
                this.setState({ listA: [...this.state.listA] });
              }}
              setNote={(row, newNote) => {
                row.note = newNote;
                this.setState({ listA: [...this.state.listA] });
              }}
              isLeft={true}
            />

            <List
              title={`Critical`}
              colour="#DA7676"
              droppableId="droppable2"
              rows={this.state.listB}
              addRow={() => this.addRow(this.state.listB)}
              deleteRow={(index) =>
                this.setState({ deletingRow: [this.state.listB, index] })
              }
              updateRowNumber={(from, to) =>
                this.setState({
                  listB: this.reorder(this.state.listB, from, to),
                })
              }
              transfer={(index) =>
                this.manualMove(this.state.listB, this.state.listA, index, 0)
              }
              setSnomed={(row, newSnomed) => {
                row.snomed = newSnomed;
                this.setState({ listB: [...this.state.listB] });
              }}
              setNote={(row, newNote) => {
                row.note = newNote;
                this.setState({ listB: [...this.state.listB] });
              }}
              isLeft={false}
            />
          </DragDropContext>
        </div>

        {this.state.deletingRow && (
          <Popup
            title="Are you sure you want to delete this diagnosis?"
            yesCallback={() => this.deleteRow(...this.state.deletingRow)}
            noCallback={() => this.setState({ deletingRow: null })}
          >
            {this.state.deletingRow[0][this.state.deletingRow[1]].content}
          </Popup>
        )}

        {/* {this.state.showNotes && (
          <Popup
            title={"Add a comment for " + this.state.showNotes.content}
            noCallback={() => this.setState({ showNotes: null })}
            yesCallback={() => {
              const newList = [...this.state.showNotes.list];
              const item = newList.find(x => x.id == this.state.showNotes.id);
              if (item) item.note = this.state.showNotes.note;

              const newState = {
                showNotes: null,
              };

              if (this.state.showNotes.list == this.state.listA) 
                newState.listA = newList;
              else if (this.state.showNotes.list == this.state.listB)
                newState.listB = newList;
              else console.log("Unknown list");

              this.setState(newState);
            }}
          >
            <textarea
              className="commentBox"
              value={this.state.showNotes.note}
              onChange={(e) => {
                let row = this.state.showNotes;
                row.note = e.target.value;
                this.setState({ showNotes: row });
              }}
            />
          </Popup>
        )} */}
      </div>
    );
  }
}

export default withFHIR(DifferentialDiagnosis);
