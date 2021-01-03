import { Button, Icon, IconButton } from '@material-ui/core';
import PlayArrow from '@material-ui/icons/PlayArrow';
import Pause from '@material-ui/icons/Pause';
import Stop from '@material-ui/icons/Stop';
import FiberManualRecord from '@material-ui/icons/FiberManualRecord';
import FastRewind from '@material-ui/icons/FastRewind';

import React from 'react'
// import { useMediaQuery } from 'react-responsive'
import '../App.css';
// import { useEffect, useState } from 'react'

export default function PlayBar(props){
    return(
        <div>
            <div className="App-Playbar" >
                <IconButton disabled={props.recordingState} onClick={props.onClickRewind} className="material-icons play-button">
                    <FastRewind style={{width: '3vw', height: '3vw', fill: 'white'}}/>
                </IconButton>
                <IconButton disabled={props.recordingState} onClick={props.onClickPlayPause} className="material-icons play-button">
                    { props.playingState
                        ? <Pause style={{width: '3vw', height: '3vw', fill: 'white'}}/>
                        : <PlayArrow style={{width: '3vw', height: '3vw', fill: 'white'}}/>
                    }
                </IconButton>
                <IconButton disabled={props.recordingState} onClick={props.onClickStop} className="material-icons play-button">
                    <Stop style={{width: '3vw', height: '3vw', fill: 'white'}}/>
                </IconButton>
                <IconButton onClick={props.onClickRecord} className="material-icons play-button">
                    <FiberManualRecord style={{width: '3vw', height: '3vw', fill: props.recordingState ? '#c4302b': '#E37B7B'}}/>
                </IconButton>
                {/* <button disabled={props.recordingState} onClick={props.onClickPlay} className="material-icons play-button">play_arrow</button>
                <button disabled={props.recordingState} onClick={props.onClickPause} className="material-icons play-button" >pause</button>
                <button disabled={props.recordingState} onClick={props.onClickStop} className="material-icons play-button">stop</button>
                {!props.recordingState && <button onClick={props.onClickRecord} className="material-icons red play-button">fiber_manual_record</button>}
                {props.recordingState && <button onClick={props.onClickRecordStop} className="material-icons redder play-button">fiber_manual_record</button>} */}    
            </div>
            <div className="App-Setting">
                <div class="column">
                    Record duration:
                    <br/>
                    <select id="recordDuration" class="dropdown-option">
                        <option value="3">&nbsp; 3 seconds</option>
                        <option value="4">&nbsp; 4 seconds</option>
                        <option value="5">&nbsp; 5 seconds</option>
                    </select>
                </div>
            </div>
        </div>
    );

}
