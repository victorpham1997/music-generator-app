import Modal from '@material-ui/core/Modal';
import Info from '@material-ui/icons/Info';
import { useEffect, useState } from 'react'
import '../App.css';
import { Button, Icon, IconButton } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
//Jazz Generation 

// Instructions: 
// (1) Familiarise yourself with the Chords and Notes are the bottom, you can either click on them or press the keys (highlighted in orange) on your keyboard 

// (2) Press the becord button (Red Circle)

// (3) Immediately enter the chords/notes of your choice. Quick you only have 2s!

// (4) Wait for generated music to load onto the screen

// (5) Press the play button (Triangle)

// (6) Enjoy! 

// (7) Before starting a new recording, please prease the stop button (Square) 

// (8) You can also pause a song by pressing the pause button ( 2 rectangular blocks)

// (9) You can also press the rewind button (loop) to listen back to our collective creation

export default function Instruction(){

    const StyledButton = withStyles({
        root: {
          background: '#fff',
          borderRadius: "60px",
          border: 0,
          color: '#000',
          height: "100%",
          padding: '2vw',
          fontWeight:"700",
          fontSize:"1.75vw",
          fontFamily:"Helvetica Neue",
          '&:hover': {
            background: "#7Ec291",
            color:"#fff"
        }
        },
        label: {
          textTransform: 'uppercase',
        },
    })(Button);
    //Modal Related
	const [open, setOpen] = useState(false); 
    const handleOpenModal = () => {
      setOpen(true);
    };
    const handleCloseModal = () => {
      setOpen(false);
    };

    function Body(){
        return(
            <div style={{width:"50%", backgroundColor:"white",borderRadius:"30px",padding:"2vw 2vw", wordWrap:"break-word"}}>
                <div style={{textAlign:"center",fontWeight:"700",fontSize:"3vw"}}>Jazz Generation</div>
                <br></br>
                <div className="modal-instructions">
                    <div className="modal-instructions-text bold">Instructions:</div>
                    <br></br>
                    <div className="modal-instructions-text">(1) Familiarise yourself with the Chords and Notes are the bottom, you can either click on them or press the keys (highlighted in orange) on your keyboard </div>
                    <br></br>
                    <div className="modal-instructions-text">(2) Press the becord button (Red Circle)</div>
                    <br></br>
                    <div className="modal-instructions-text">(3) Immediately enter the chords/notes of your choice. Quick you only have 2s!</div>
                    <br></br>
                    <div className="modal-instructions-text">(4) Wait for generated music to load onto the screen</div>
                    <br></br>
                    <div className="modal-instructions-text">(5) Press the play button (Triangle)</div>
                    <br></br>
                    <div className="modal-instructions-text">(6) Enjoy!</div>
                    <br></br>
                    <div className="modal-instructions-text">(7) Before starting a new recording, please prease the stop button (Square) </div>
                    <br></br>
                    <div className="modal-instructions-text">(8) You can also pause a song by pressing the pause button ( 2 rectangular blocks)</div>
                    <br></br>
                    <div className="modal-instructions-text">(9) You can also press the rewind button (Double Triangle) to listen back to our collective creation</div>
                    <br></br>
                    
                </div>
            </div>
        )
    }

    return(
        <div style={{width:"20%"}}>
            <IconButton type="button" onClick={handleOpenModal} className="instruction-button">
                <Info style={{width: '5vw', height: '5vw', fill: '#0C1115'}}/>
            </IconButton>
            <Modal
                  open={open}
                  onClose={handleCloseModal}
                  aria-labelledby="simple-modal-title"
                  aria-describedby="simple-modal-description"
                  style={{display:'flex',alignItems:'center',justifyContent:'center'}}
                >
                    <Body></Body>
            </Modal>
        </div>
    )
}