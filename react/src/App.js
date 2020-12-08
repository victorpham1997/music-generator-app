import './App.css';
import { useEffect, useState } from 'react'
import Player from './Player';
import * as Tone from 'tone'
import PlayBar from './components/Playbar'
import data from './public/data'
import Recorder from './Recorder';
import Mousetrap from 'mousetrap'
import Model from './Model';



let interval;
function App() {
	let SampleChords = data.sampleChords
	const [recording, setRecording] = useState(false);
	const [player, setPlayer] = useState(new Player());
	const [playerTwo, setPlayerTwo] = useState(new Player());
	const [recorder, setRecorder] = useState(new Recorder());
	const [model, setModel] = useState(new Model());
	const [notes, setNotes] = useState([]);
	const [playheadTime, setPlayheadTime] = useState(0);
	const [presentChords, setPresetChords] = useState([]);

	const [currentChord, setCurrentChord] = useState(null);

	useEffect(() => {
		(async () => {
			await player.setup();
			player.sync();
			setPlayer(player);
			await playerTwo.setup();
			setPlayerTwo(playerTwo);

			setPresetChords(SampleChords)
			
			if (!interval) {
				interval = setInterval(() => {
					setPlayheadTime(Tone.Transport.seconds * DURATION_FACTOR)
					
					//retrieve recording state
					setRecording(recording=>{
						if(recording) {
							let notes = recorder.getVisualNotes();						
							setNotes(notes);
						}
						return recording;
					})
				}, 50);
			}


			recorder.onFinishRecording = async (result)=>{
				setRecording(false);
				Tone.Transport.stop()
				console.log(result)
				let midiFile = await model.generateFromUserInput(result);
				let playbackNotes = player.notesFromMidiFile(midiFile);
				player.addNotes(playbackNotes);
				setNotes(notes=>[...notes, ...playbackNotes]);
			};
		})()
	}, []); //on component mount

	const MAX_MIDI = 88
	const NOTE_HEIGHT = 8
	const DURATION_FACTOR = 100

	async function onChordDown(chord) {
		if (chord != currentChord) {
			await playerTwo.triggerChordAttack(chord.array);
			setCurrentChord(chord);
		}
		
		recorder.onChordPressed(chord);
	}
	
	async function onChordUp(chord) {
		// console.log(chord)
		if (chord == currentChord) {
			setCurrentChord(null)
		}
		await playerTwo.triggerChordRelease(chord.array);
		
		recorder.onChordReleased(chord);
	}

	for (let chord of data.sampleChords) {
		Mousetrap.bind(chord.key, () => onChordDown(chord), 'keypress');
		Mousetrap.bind(chord.key, () => onChordUp(chord), 'keyup');
	}


	return (
		<div className="App">
			<div style={{position: 'absolute', top: 10, right: 20, color: 'tomato'}}>{recorder.windowLength - recorder.slices.length}</div>
			<div className="App-header">
				<div style={{ width: "20%", textTransform: "uppercase" }}>2.5K only<br></br> music generation <br></br> project</div>
				<PlayBar
					onClickPlay={async () => {
						if(notes.length == 0) {
							let midiFile = await player.midiFileFromUrl('/ABeautifulFriendship.mid');
							let notes = player.notesFromMidiFile(midiFile);
							player.addNotes(notes);
							setNotes(notes);
						}

						if(Tone.context.state == 'suspended') {
							Tone.start()
						}

						Tone.Transport.start()				
					}}
					onClickPause={() => player.pausePlayback()}
					onClickStop={async () => {
						await player.stopMidiFile();
						setNotes([]);
					}}
					onClickRecord={() => {
						// if(Tone.context.state == 'suspended') {
						// 	Tone.start()
						// }

						Tone.Transport.start() //to start time
						recorder.startRecording();
						setRecording(true);
					
					}}
					onClickRecordStop={() => {
						recorder.finishRecording();
						
					}}
					recordingState = {recording}
				/>
				<div style={{ width: "20%" }}></div>
			</div>
			{/* <button onClick={() => setPlay(true)}>begin</button>    */}

			{/* {notes.map((note, i) => {
				// const noteDescription = `${note.name} note: ${note.midi} dur:${note.duration} time:${note.time}`
				const noteDescription = `${note.name}`
				return <div
				key={`${i}`}
				style={{ position: 'absolute', left: note.time * DURATION_FACTOR - playheadTime, top: MAX_MIDI * NOTE_HEIGHT - note.midi * NOTE_HEIGHT, width: note.duration * DURATION_FACTOR, height: NOTE_HEIGHT, backgroundColor: 'tomato' }}
				>{noteDescription}</div>
			}
		)} */}
			<div className="App-piano">
				<div style={{height: '100%', width: 6, position: 'absolute', left: 500, top: 0, backgroundColor: 'white', zIndex: 999}}/>
				{notes.map((note, i) => {
					let recorded = note.recorded || false;
					// let offset = recording ? 0 : playheadTime
					let offset = playheadTime - 500
					return <div
						key={`${i}`}
						style={{ position: "absolute", left: note.time * DURATION_FACTOR - offset, top: MAX_MIDI * NOTE_HEIGHT - note.midi * NOTE_HEIGHT, width: note.duration * DURATION_FACTOR, height: NOTE_HEIGHT, backgroundColor: recorded ? 'tomato' : '#7Ec291' }}
					></div>
				}
				)}
			</div>
			{/* <div style={{backgroundColor:"yellow",position:"relative"}}> HELLO</div> */}
			<div className="App-preset-container">
				{presentChords.map((chord) => {
					return <button
						className="App-preset"
						id={`${chord.key}`}
						key={`${chord.key}`}
						name={`${chord.name}`}
						onPointerUp={(e) => onChordUp(chord)}
						onPointerDown={(e) => onChordDown(chord)}
					// onKeyUp={(e)=>onChordUp(chord)}
					// onKeyDown={(e)=>onChordDown(chord)}
					>
						<div style={{ paddingTop: "2.5vw", fontSize: "1.25vw" }}>{chord.name}</div>
						<div style={{ paddingTop: "1.25vw", fontSize: "1vw", color: "#E37B7B" }}>{chord.key}</div>
					</button>
				})}
			</div>
		</div>
	);
}

export default App;
