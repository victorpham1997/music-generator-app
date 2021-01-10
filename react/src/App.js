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
	const [usePostProcess, setUsePostProcess] = useState(true);
	const [loadingText, setLoadingText] = useState('WAKING A.I. UP...\n');
	const [player, setPlayer] = useState(new Player());
	const [playerTwo, setPlayerTwo] = useState(new Player());
	const [recorder, setRecorder] = useState(new Recorder());
	const [model, setModel] = useState(new Model());
	const [notes, setNotes] = useState([]);
	const [playheadTime, setPlayheadTime] = useState(0);
	const [presentChords, setPresetChords] = useState([]);


	const [currentChord, setCurrentChord] = useState(null);
	const screenRatio = window.screen.availHeight/window.screen.availWidth;


	useEffect(() => {
		(async () => {
			await player.setup();
			player.sync();
			setPlayer(player);
			await playerTwo.setup();
			setPlayerTwo(playerTwo);

			setPresetChords(SampleChords)
			if(screenRatio<1){
				console.log("Screen ratio is acceptable");
			}else{
				console.log("Please enable rotate and switch to lanscape on your device");
				document.getElementById("screenRatioAlert").style.visibility = 'visible';

			}
			// if(!localStorage.getItem("first_time")) {
			//     // first time loaded!
			//     localStorage.setItem("first_time","1");

			// }
			document.getElementById("helpButton").click();
						
			if (!interval) {
				interval = setInterval(() => {
					setPlayheadTime(Tone.Transport.seconds * DURATION_FACTOR);

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
					//retrieve playing state
					setUsePostProcess(usePostProcess=>{
						return usePostProcess;
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


				var buffer_pause = false;

				for(let i=0; i<999; i++) {
					if(Tone.Transport.seconds > (i*5+2.5)){
						if(Tone.Transport.state=="started"){
							buffer_pause = true;
							document.getElementById("buffering").style.visibility = 'visible';
							player.pausePlayback()
						}
					}else if(Tone.Transport.seconds < (i*5 - 10)){
						if(Tone.Transport.state!="started" && buffer_pause){
							buffer_pause = false;
							if(Tone.context.state == 'suspended') {
								Tone.start();
							}
							Tone.Transport.start();
							document.getElementById("buffering").style.visibility = 'hidden';

						}
					}

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

	const MAX_MIDI = 100
	const NOTE_HEIGHT = 4
	const DURATION_FACTOR = 100
	async function onChordDown(chord) {
		if (chord != currentChord) {
			await playerTwo.triggerChordAttack(chord.array);
			setCurrentChord(chord);
		}
		recorder.onChordPressed(chord);
		console.log(chord.name)
		document.getElementById(chord.name).classList.add("active");
	}
	
	async function onChordUp(chord) {
		// console.log(chord)
		if (chord == currentChord) {
			setCurrentChord(null)
		}
		await playerTwo.triggerChordRelease(chord.array);
		recorder.onChordReleased(chord);
		document.getElementById(chord.name).classList.remove("active");

	}

	for (let chord of data.sampleChords) {
		Mousetrap.bind(chord.key, () => onChordDown(chord), 'keypress');
		Mousetrap.bind(chord.key, () => onChordUp(chord), 'keyup');

	}
	function sleep(ms) {
	  return new Promise(resolve => setTimeout(resolve, ms));
	}

 // suitable, please enable device rotation and rotate to horizontal mode. Thank you!
	return (
		<div className="App">
			<div style={{position: 'absolute', top: 10, right: 20, zIndex:'1', color: 'tomato'}}>{recorder.windowLength - recorder.slices.length}</div>
			<div class = "overlay" id="count3" style={{visibility:'hidden'}}>Record in 3</div>
			<div class = "overlay" id="count2" style={{visibility:'hidden'}}>Record in 2</div>
			<div class = "overlay" id="count1" style={{visibility:'hidden'}}>Record in 1</div>
			<div class = "overlay" id="screenRatioAlert" style={{visibility:'hidden'}}>Your screen ratio is not suitable for the application, please enable screen rotation, rotate to horizontal and reload the page. Thank you!</div>
			<div class = "overlay" id="buffering" style={{visibility:'hidden', fontSize:"5vw", display:"block"}}><br></br><br></br><p>Buffering...</p><p style={{fontSize:"1vw"}}>You can pause and wait for a short while or rewind back to the beginning, so sorry for this :)</p></div>
			<div className="App-header">
				<div style={{ width: "20%", textTransform: "uppercase", fontSize: "2vw"}}>jazz generation project </div>
				<PlayBar
					onClickPlayPause={async() =>{
						console.log(usePostProcess);
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
							console.log("duration is:" + Tone.Transport.seconds)
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
					onClickChangePostProcess= {() =>{
						setUsePostProcess(!usePostProcess);
						model.changeUsePostProcess(!usePostProcess);
					}}
					usePostProcessState = {usePostProcess}
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
								class="App-preset"
								id={`${chord.name}`}
								key={`${chord.key}`}
								name={`${chord.name}`}
								onPointerUp={(e) => onChordUp(chord)}
								onPointerDown={(e) => onChordDown(chord)}
								onPointerOut={(e) => onChordUp(chord)}
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
								id={`${chord.name}`}
								key={`${chord.key}`}
								name={`${chord.name}`}
								onPointerUp={(e) => onChordUp(chord)}
								onPointerOut={(e) => onChordUp(chord)}
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
						<li class="black gs" id="G#3" onPointerUp={(e) => onChordUp(SampleChords[10])} onPointerOut={(e) => onChordUp(SampleChords[10])}  onPointerCancOut={(e) => onChordUp(SampleChords[10])} onPointerDown={(e) => onChordDown(SampleChords[10])}>q</li>
						<li class="white g" id="A3" onPointerUp={(e) => onChordUp(SampleChords[11])} onPointerOut={(e) => onChordUp(SampleChords[11])} onPointerDown={(e) => onChordDown(SampleChords[11])}>a</li>
						<li class="black fs" id="A#3" onPointerUp={(e) => onChordUp(SampleChords[12])} onPointerOut={(e) => onChordUp(SampleChords[12])} onPointerDown={(e) => onChordDown(SampleChords[12])}>w</li>
						<li class="white f" id="B3" onPointerUp={(e) => onChordUp(SampleChords[13])} onPointerOut={(e) => onChordUp(SampleChords[13])} onPointerDown={(e) => onChordDown(SampleChords[13])}>s</li>
						<li class="white e" id="C4" onPointerUp={(e) => onChordUp(SampleChords[14])} onPointerOut={(e) => onChordUp(SampleChords[14])} onPointerDown={(e) => onChordDown(SampleChords[14])}>d</li>
						<li class="black ds" id="C#4" onPointerUp={(e) => onChordUp(SampleChords[15])} onPointerOut={(e) => onChordUp(SampleChords[15])} onPointerDown={(e) => onChordDown(SampleChords[15])}>r</li>
						<li class="white d" id="D4" onPointerUp={(e) => onChordUp(SampleChords[16])} onPointerOut={(e) => onChordUp(SampleChords[16])} onPointerDown={(e) => onChordDown(SampleChords[16])}>f</li>
						<li class="black cs" id="D#4" onPointerUp={(e) => onChordUp(SampleChords[17])} onPointerOut={(e) => onChordUp(SampleChords[17])} onPointerDown={(e) => onChordDown(SampleChords[17])}>t</li>
						<li class="white c" id="E4" onPointerUp={(e) => onChordUp(SampleChords[18])} onPointerOut={(e) => onChordUp(SampleChords[18])} onPointerDown={(e) => onChordDown(SampleChords[18])}>g</li>
						<li class="white b " id="F4" onPointerUp={(e) => onChordUp(SampleChords[19])} onPointerOut={(e) => onChordUp(SampleChords[19])} onPointerDown={(e) => onChordDown(SampleChords[19])}>h</li>
						<li class="black as" id="F#4" onPointerUp={(e) => onChordUp(SampleChords[20])} onPointerOut={(e) => onChordUp(SampleChords[20])} onPointerDown={(e) => onChordDown(SampleChords[20])}>u</li>
						<li class="white a" id="G4" onPointerUp={(e) => onChordUp(SampleChords[21])} onPointerOut={(e) => onChordUp(SampleChords[21])} onPointerDown={(e) => onChordDown(SampleChords[21])}>j</li>
						<li class="black gs" id="G#4" onPointerUp={(e) => onChordUp(SampleChords[22])} onPointerOut={(e) => onChordUp(SampleChords[22])} onPointerDown={(e) => onChordDown(SampleChords[22])}>i</li>
						<li class="white g" id="A4" onPointerUp={(e) => onChordUp(SampleChords[23])} onPointerOut={(e) => onChordUp(SampleChords[23])} onPointerDown={(e) => onChordDown(SampleChords[23])}>k</li>
						<li class="black fs" id="A#4" onPointerUp={(e) => onChordUp(SampleChords[24])} onPointerOut={(e) => onChordUp(SampleChords[24])} onPointerDown={(e) => onChordDown(SampleChords[24])}>o</li>
						<li class="white f" id="B4" onPointerUp={(e) => onChordUp(SampleChords[25])} onPointerOut={(e) => onChordUp(SampleChords[25])} onPointerDown={(e) => onChordDown(SampleChords[25])}>l</li>
						<li class="white e" id="C5" onPointerUp={(e) => onChordUp(SampleChords[26])} onPointerOut={(e) => onChordUp(SampleChords[26])} onPointerDown={(e) => onChordDown(SampleChords[26])}>;</li>
						<li class="black ds" id="C#5" onPointerUp={(e) => onChordUp(SampleChords[27])} onPointerOut={(e) => onChordUp(SampleChords[27])} onPointerDown={(e) => onChordDown(SampleChords[27])}>[</li>
						<li class="white d" id="D5" onPointerUp={(e) => onChordUp(SampleChords[28])} onPointerOut={(e) => onChordUp(SampleChords[28])} onPointerDown={(e) => onChordDown(SampleChords[28])}>'</li>
						<li class="black cs" id="D#5" onPointerUp={(e) => onChordUp(SampleChords[29])} onPointerOut={(e) => onChordUp(SampleChords[29])} onPointerDown={(e) => onChordDown(SampleChords[29])}>]</li>
						<li class="white c"></li>
					</ul>

				</div>
			</div>
		</div>
	);
}

export default App
