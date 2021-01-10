import Modal from '@material-ui/core/Modal';
import Info from '@material-ui/icons/Info';
import Help from '@material-ui/icons/Help';
import PlayArrow from '@material-ui/icons/PlayArrow';
import Pause from '@material-ui/icons/Pause';
import Stop from '@material-ui/icons/Stop';
import FiberManualRecord from '@material-ui/icons/FiberManualRecord';
import FastRewind from '@material-ui/icons/FastRewind';
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
                <div style={{textAlign:"center",fontWeight:"700",fontSize:"3vw"}}>Welcome to the Jazz Generation Project!</div>
                <br></br>
                <div className="modal-instructions">
                    <div className="modal-instructions-text bold">Instructions:</div>
                    <br></br>
                    <div className="modal-instructions-text">(1) Familiarise yourself with the Chords and Notes at the bottom, you can use your keyboard to play as indicated on each note and chord</div>
                    <br></br>
                    <div className="modal-instructions-text">(2) Press the record button <FiberManualRecord style={{width: '1.25vw', height: '1.25vw', fill:'#c4302b'}}/></div>
                    <br></br>
                    <div className="modal-instructions-text">(3) After 3 seconds, enter the chords/notes of your choice, <b>the predicted notes are quite dependent on your input so try to be as creative as possible!!!</b>.</div>
                    <br></br>
                    <div className="modal-instructions-text">(4) Wait for generated music to load onto the screen</div>
                    <br></br>
                    <div className="modal-instructions-text">(5) Press the play button <PlayArrow style={{width: '1.25vw', height: '1.25vw', fill: 'black'}}/></div>
                    <br></br>
                    <div className="modal-instructions-text">(6) Enjoy! (although there will be buffering sometimes due to potato server, sorry...)</div>
                    <br></br>
                    <div className="modal-instructions-text">(7) Before starting a new recording, please prease the stop button <Stop style={{width: '1.25vw', height: '1.25vw', fill: 'black'}}/> </div>
                    <br></br>
                    <div className="modal-instructions-text">(8) You can also pause a song by pressing the pause button <Pause style={{width: '1.25vw', height: '1.25vw', fill: 'black'}}/></div>
                    <br></br>
                    <div className="modal-instructions-text">(9) You can also press the rewind button <FastRewind style={{width: '1.25vw', height: '1.25vw', fill: 'black'}}/> to listen back to our collective creation</div>
                    <br></br>
                    <div className="modal-instructions-text" style={{fontSize:"1.1vw"}}><i>Lastly, this web app and project was made by <a href="https://github.com/elliotmoose">Elliot Koh</a>, <a href="https://github.com/oliviergoals">Sean Lim</a>, <a href="https://github.com/sidharth3">Sidharth Praveen</a> and <a href="https://github.com/victorpham1997">Viet Pham</a>. For more information on the project and source code, please visit <a href="https://github.com/victorpham1997">this article</a>!</i></div>
                    <br></br>
                    <div className="modal-instructions-text" style={{fontSize:"0.8vw"}}>Press outside the box to continue.</div>
                    <br></br>
                    
                </div>
            </div>
        )
    }

    return(
        <div style={{width:"20%"}}>
            <IconButton id = "helpButton" type="button" onClick={handleOpenModal} className="instruction-button">
                <Help style={{width: '5vw', height: '5vw', fill: '#0C1115'}}/>
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