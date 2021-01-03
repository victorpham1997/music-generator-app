import tensorflow as tf
from tensorflow import keras
import pickle
import numpy as np
import random
import pretty_midi
from sklearn.preprocessing import MultiLabelBinarizer
import io

def sample_from(logits, k):
    logits, indices = tf.math.top_k(logits, k= k, sorted=True)
    indices = np.asarray(indices).astype("int32")
    preds = keras.activations.softmax(tf.expand_dims(logits, 0))[0]
    preds = np.asarray(preds).astype("float32")
    out = np.random.choice(indices, p=preds)
    return np.random.choice(indices, p=preds)

def pianoRollToTokenSequence(piano_roll, combi_to_int):
    mlb = MultiLabelBinarizer()
    mlb.fit([np.arange(128).tolist()])
    combi_pairs = mlb.inverse_transform(piano_roll)
    return [combi_to_int[combi] for combi in combi_pairs]

def combiSequenceToTokenSequence(combi_sequence, combi_to_int):
    return [combi_to_int[combi] if combi in combi_to_int else 0 for combi in combi_sequence]
#internal
def tokenSequenceToPianoRoll(token_sequence, int_to_combi):
    mlb = MultiLabelBinarizer()
    mlb.fit([np.arange(128).tolist()])
    combi_pairs = [int_to_combi[i] for i in token_sequence]
    piano_roll = mlb.transform(combi_pairs)
    return piano_roll

def tokenSequenceToMidi(token_sequence, int_to_combi, bpm):
    piano_roll = tokenSequenceToPianoRoll(token_sequence, int_to_combi)    
    frequency = 1/((60/bpm)/4)
    mid_out = piano_roll_to_pretty_midi(piano_roll.T, fs=frequency, bpm=bpm)
    return mid_out

def piano_roll_to_pretty_midi(piano_roll_in, fs, program=0, velocity = 64, bpm=100):
    '''Convert a Piano Roll array into a PrettyMidi object
     with a single instrument.
    Parameters
    ----------
    piano_roll : np.ndarray, shape=(128,frames), dtype=int
        Piano roll of one instrument
    fs : int
        Sampling frequency of the columns, i.e. each column is spaced apart
        by ``1./fs`` seconds.
    program : int
        The program number of the instrument.
    Returns
    -------
    midi_object : pretty_midi.PrettyMIDI
        A pretty_midi.PrettyMIDI class instance describing
        the piano roll.
    '''
    piano_roll = np.where(piano_roll_in == 1, 64, 0)
    notes, frames = piano_roll.shape
    pm = pretty_midi.PrettyMIDI(initial_tempo=bpm)
    instrument = pretty_midi.Instrument(program=program)

    # pad 1 column of zeros so we can acknowledge inital and ending events
    piano_roll = np.pad(piano_roll, [(0, 0), (1, 1)], 'constant')
    # print(piano_roll.shape)
    
    # use changes in velocities to find note on / note off events
    velocity_changes = np.nonzero(np.diff(piano_roll).T)

    # keep track on velocities and note on times
    prev_velocities = np.zeros(notes, dtype=int)
    note_on_time = np.zeros(notes)

    for time, note in zip(*velocity_changes):
        # use time + 1 because of padding above
        velocity = piano_roll[note, time + 1]
        time = time / fs
        if velocity > 0:
            if prev_velocities[note] == 0:
                note_on_time[note] = time
                prev_velocities[note] = velocity
        else:
            pm_note = pretty_midi.Note(
                velocity=prev_velocities[note],
                pitch=note,
                start=note_on_time[note],
                end=time)
            instrument.notes.append(pm_note)
            prev_velocities[note] = 0
    pm.instruments.append(instrument)
    return pm


def prettyMidiToBytesIO(pretty_midi_file):    
    buffer = io.BytesIO()
    pretty_midi_file.write(buffer)
    return buffer