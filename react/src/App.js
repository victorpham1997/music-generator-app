import './App.css';
import { useEffect, useState } from 'react'
import Player from './Player';
import * as Tone from 'tone'
import PlayBar from './components/Playbar'
import Insturction from './components/Instructions'
import data from './public/data'
import Recorder from './Recorder';
import Mousetrap from 'mousetrap'
import Model from './Model';
import { CircularProgress, Button, withTheme }  from '@material-ui/core'


let interval;
function App() {
	let SampleChords = data.sampleChords
	const [recording, setRecording] = useState(false);
	const [playing, setPlaying] = useState(false);
	const [initializingGeneration, setInitializingGeneration] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [loadingText, setLoadingText] = useState('WAKING A.I. UP...\n');
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
					//retrieve playing state
					setPlaying(playing=>{
						return playing;
					})
				}, 50);
			}


			recorder.onFinishRecording = async (result)=>{
				const time_interval = 1250
				let timeout = sleep(() => {
					setLoadingText(text => text+'BRUSHING TEETH...\n')
					timeout = sleep(() => {
						setLoadingText(text=> text+'ALMOST READY...\n')						
						timeout = sleep(() => {
							setLoadingText(text=> text+'DESTROYING GPUs...\n')							
							timeout = sleep(() => {
								setLoadingText(text=> text+'MAKING MUSIC...\n')							
							}, time_interval);
						}, time_interval);
					}, time_interval);
				}, time_interval);

				setRecording(false);
				Tone.Transport.stop()
				setIsGenerating(true)
				setInitializingGeneration(true);
				let midiFile = await model.userInputToMidi(result);
				let playbackNotes = player.notesFromMidiFile(midiFile);
				for(let note of playbackNotes) {
					note.user = true
				}
				player.addNotes(playbackNotes);
				
				let {midi: generatedMidiFile, slicesBeforeGenerated } = await model.generateNext();
				let timeOffset = slicesBeforeGenerated * recorder.timeSlice;
				let generatedNotes = player.notesFromMidiFile(generatedMidiFile, timeOffset);					
				player.addNotes(generatedNotes);					
				setNotes(notes=>[...notes, ...playbackNotes, ...generatedNotes]);			
				setInitializingGeneration(false);

				clearTimeout(timeout)
				setLoadingText('WAKING A.I. UP...\n')

				for(let i=0; i<999; i++) {
					let {midi: generatedMidiFile, slicesBeforeGenerated } = await model.generateNext();
					let timeOffset = slicesBeforeGenerated * recorder.timeSlice;
					let generatedNotes = player.notesFromMidiFile(generatedMidiFile, timeOffset);					
					player.addNotes(generatedNotes);
					setNotes(notes=>[...notes, ...generatedNotes]);									
					let shouldStop = false;
					setIsGenerating(isGenerating => {
						shouldStop = !isGenerating;
						return isGenerating;
					})

					if(shouldStop) {
						console.log("Stopped Generating!")
						break;
					}
				}
				
			};
		})()
	}, []); //on component mount

	const MAX_MIDI = 88
	const NOTE_HEIGHT = 5
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
	function sleep(ms) {
	  return new Promise(resolve => setTimeout(resolve, ms));
	}

	return (
		<div className="App">
			<div style={{position: 'absolute', top: 10, right: 20, zIndex:'1', color: 'tomato'}}>{recorder.windowLength - recorder.slices.length}</div>
			<div class = "overlay" id="count3" style={{visibility:'hidden'}}>3</div>
			<div class = "overlay" id="count2" style={{visibility:'hidden'}}>2</div>
			<div class = "overlay" id="count1" style={{visibility:'hidden'}}>1</div>
			<div className="App-header">
				<div style={{ width: "20%", textTransform: "uppercase", fontSize: "2vw"}}>jazz generation project </div>
				<PlayBar
					onClickPlayPause={async() =>{
						if(playing==false){
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
							setPlaying(true)
						}else{
							player.pausePlayback()
							setPlaying(false)
						}

					}}

					onClickStop={async () => {
						await player.stopMidiFile();						
						setIsGenerating(false);
						setNotes([]);
						setPlaying(false);
					}}
					onClickRecord={async () => {
						//reset
						recorder.reset();
						model.reset();
						await player.stopMidiFile();						
						setIsGenerating(false);
						setNotes([]);

						var duration = parseInt(document.getElementById("recordDuration").value);

						document.getElementById("count3").style.visibility = 'visible';
						await sleep(1000);
						document.getElementById("count3").style.visibility = 'hidden';
						document.getElementById("count2").style.visibility = 'visible';
						await sleep(1000);
						document.getElementById("count2").style.visibility = 'hidden';
						document.getElementById("count1").style.visibility = 'visible';
						await sleep(1000);
						document.getElementById("count1").style.visibility = 'hidden';

						Tone.Transport.start() //to start time
						recorder.startRecording(duration);
						setRecording(true);
					
					}}
					onClickRecordStop={() => {
						recorder.finishRecording();						
					}}
					onClickRewind={() => {
						Tone.Transport.pause()
						Tone.Transport.seconds = 0
						setPlaying(false);
					}}
					recordingState = {recording}
					playingState = {playing}
				/>
				{/* <div style={{ width: "20%" }}></div> */}
				<Insturction></Insturction>
			</div>
			<div className="App-piano">				
				{initializingGeneration && <div style={{height: '100%', width: '100%', position: 'absolute',left: 0, top: 0, zIndex: 1000, display: 'flex'}}>
					<div style={{height: '100%', width: '100%', position: 'absolute',left: 0, top: 0, backgroundColor: 'black', opacity: 0.3, zIndex: 10}}/>
					<p style={{position: 'absolute', whiteSpace: 'pre-wrap', left: 50, top: 6, fontSize: 12, fontFamily: 'monospace', color: '#7Ec291', zIndex: 50}}>{loadingText}</p>
					<CircularProgress color='primary' size={14} style={{marginLeft: 12, marginTop: 20}}/>
				</div>}
				<div style={{height: '100%', width: 6, position: 'absolute', left: 500, top: 0, backgroundColor: 'white', zIndex: 999, borderRadius: 3}}/>
				{notes.map((note, i) => {
					let isFar = Math.abs(note.time * DURATION_FACTOR - playheadTime) > 2000;
					if(isFar) {
						return null;
					}

					let recorded = note.user || false;
					// let offset = recording ? 0 : playheadTime
					let offset = playheadTime - 500
					return <div
						key={`${i}`}
						style={{ position: "absolute", left: note.time * DURATION_FACTOR - offset, top: MAX_MIDI * NOTE_HEIGHT - note.midi * NOTE_HEIGHT, width: note.duration * DURATION_FACTOR, height: NOTE_HEIGHT, backgroundColor: recorded ? '#BE2F29' : '#7Ec291' }}
					></div>
				}
				)}
			</div>
			<div style={{height:'25%', display:'flex'}}>
				<div style={{height:'100%', width:'40%', margin:'0 0.25% 0 0.5%'}}>
					<div className="App-preset-container">
						{presentChords.slice(0,5).map((chord) => {
							return <button
								className="App-preset"
								id={`${chord.name}`}
								key={`${chord.key}`}
								name={`${chord.name}`}
								onPointerUp={(e) => onChordUp(chord)}
								onPointerDown={(e) => onChordDown(chord)}
							// onKeyUp={(e)=>onChordUp(chord)}
							// onKeyDown={(e)=>onChordDown(chord)}
							>
								<div style={{ paddingTop: "0.5vw", fontSize: "1.25vw" }}>{chord.name}</div>
								<div style={{ paddingTop: "1.25vw", fontSize: "1.25vw", color: "#E37B7B" }}>{chord.key}</div>
							</button>
						})}
					</div>
					<div className="App-preset-container">
						{presentChords.slice(5,10).map((chord) => {
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
								<div style={{ paddingTop: "0.5vw", fontSize: "1.25vw" }}>{chord.name}</div>
								<div style={{ paddingTop: "1.25vw", fontSize: "1.25vw", color: "#E37B7B" }}>{chord.key}</div>
							</button>
						})}
					</div>
				</div>
				<div style={{height:'100%'}}>
					<ul class="set">
						<li class="white b"></li>
						<li class="black as"></li>
						<li class="white a"></li>
						<li class="black gs"></li>
						<li class="white g">a</li>
						<li class="black fs">w</li>
						<li class="white f">s</li>
						<li class="white e">d</li>
						<li class="black ds">r</li>
						<li class="white d">f</li>
						<li class="black cs">t</li>
						<li class="white c">g</li>
						<li class="white b">h</li>
						<li class="black as">u</li>
						<li class="white a">j</li>
						<li class="black gs">i</li>
						<li class="white g">k</li>
						<li class="black fs">o</li>
						<li class="white f">l</li>
						<li class="white e">;</li>
						<li class="black ds">[</li>
						<li class="white d">'</li>
						<li class="black cs"></li>
						<li class="white c"></li>
					</ul>

				</div>
			</div>
		</div>
	);
}

export default App
