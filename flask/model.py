import helpers
import tensorflow as tf
from tensorflow import keras
import pickle
import numpy as np
import random
import pretty_midi
import glob
from sklearn.preprocessing import MultiLabelBinarizer

# chunk_duration = 300
chunk_duration = 300
bpm = 120

class Model:
    def __init__(self):
        dir = './model'
        self.load_model(dir)
        self.load_dictionaries(dir)

    def load_model(self, dir):
        self.model = tf.keras.models.load_model(dir)
        self.model.summary()
        print('== Model Loaded!')

    def load_dictionaries(self, dir):
        with open(dir + '/combi_to_int.pickle', 'rb') as f:
            self.combi_to_int = pickle.load(f)
        
        with open(dir + '/int_to_combi.pickle', 'rb') as f:
            self.int_to_combi = pickle.load(f)

        print('== Dictionaries Loaded!')

    def generateMidiBytesFromCombiSequence(self, combi_sequence, num_note_to_gen):    
        token_sequence = helpers.combiSequenceToTokenSequence(combi_sequence, self.combi_to_int)
        return self.generateMidiBytesFromTokenSequence(token_sequence, num_note_to_gen)

    def generateMidiBytesFromPianoRollSequence(self, piano_roll_sequence, num_note_to_gen):    
        token_sequence = helpers.pianoRollToTokenSequence(piano_roll_sequence, self.combi_to_int)
        return self.generateMidiBytesFromTokenSequence(token_sequence, num_note_to_gen)

    def generateMidiBytesFromTokenSequence(self, token_sequence, num_note_to_gen):    
        """
        @return in midi file bytes
        """
        tokens_generated = self.generateTokenSequenceFromTokenSequence(token_sequence, num_note_to_gen)

        # return tokens_generated
        pretty_midi_file = helpers.tokenSequenceToMidi(tokens_generated, self.int_to_combi, bpm)
        return helpers.prettyMidiToBytesIO(pretty_midi_file)

    def generateTokenSequenceFromTokenSequence(self, token_sequence, num_note_to_gen):    

        # if len(token_sequence) > chunk_duration:
        #     token_sequence = token_sequence[:chunk_duration]
        
        # if len(token_sequence) < chunk_duration:
        #     #pad sequences
        #     print(f"sequence has length {len(token_sequence)}. adding padding...")
        #     while len(token_sequence) < chunk_duration:
        #         token_sequence.insert(0, self.combi_to_int[tuple([])])


        # while len(tokens_generated) <= num_note_to_gen:
        #     x = token_sequence[-chunk_duration:]
        #     x = np.array([x])
        #     y, _ = self.model.predict(x)
        #     sample_token = helpers.sample_from(y[0][-1], 10)
        #     tokens_generated.append(int(sample_token))
        #     token_sequence.append(sample_token)
        
        #     print(f"generated {len(tokens_generated)} notes")
        # return tokens_generated
        tokens_generated = []
        while len(tokens_generated) <= num_note_to_gen:
            x = token_sequence[-chunk_duration:]
            pad_len = chunk_duration - len(x)
            sample_index = -1
            if pad_len > 0:
                print(f"sequence has length {len(token_sequence)}. adding {pad_len} padding...")
                x = token_sequence + [0] * pad_len
                sample_index = len(token_sequence) - 1
            x = np.array([x])
            print(x)
            y, _ = self.model.predict(x)
            sample_token = helpers.sample_from(y[0][sample_index], 10)
            tokens_generated.append(int(sample_token))
            token_sequence.append(sample_token)

            print(f"generated {len(tokens_generated)} notes")
        return tokens_generated

    def combiSequenceToMidiBytes(self, combi_sequence):
        token_sequence = helpers.combiSequenceToTokenSequence(combi_sequence, self.combi_to_int)
        pretty_midi_file = helpers.tokenSequenceToMidi(token_sequence, self.int_to_combi, bpm)
        return helpers.prettyMidiToBytesIO(pretty_midi_file)





# model = Model()
# song_piano_roll = np.load('./encoded_SmallDay.npy').astype(np.int8)
# with open('./outputs/test.mid', 'wb') as out:
#     output = model.generateMidiFromPianoRollSequence(song_piano_roll[:sequence_length], 5)
#     out.write(output)
