//src/hooks/useWebMidi.ts

import { useState, useEffect, useRef } from 'react';

export const useWebMidi = (
  onNoteOn: (note: string, velocity: number) => void,
  onNoteOff: (note: string) => void,
  onLog: (type: 'system' | 'input-on' | 'input-off' | 'error', message: string) => void
) => {
  const [midiConnected, setMidiConnected] = useState(false);
  const [midiDeviceName, setMidiDeviceName] = useState('None');

  const onNoteOnRef = useRef(onNoteOn);
  const onNoteOffRef = useRef(onNoteOff);
  const onLogRef = useRef(onLog);

  useEffect(() => {
    onNoteOnRef.current = onNoteOn;
    onNoteOffRef.current = onNoteOff;
    onLogRef.current = onLog;
  }, [onNoteOn, onNoteOff, onLog]);

  useEffect(() => {
    onLogRef.current('system', 'Initializing Synthesizer Studio...');

    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess()
        .then((access) => {
          const updateMidiDevices = () => {
            const inputs = Array.from(access.inputs.values());
            if (inputs.length > 0) {
              setMidiConnected(true);
              setMidiDeviceName(inputs[0].name || 'MIDI Controller');
              onLogRef.current('system', `MIDI Controller Connected: ${inputs[0].name}`);
            } else {
              setMidiConnected(false);
              setMidiDeviceName('None');
              onLogRef.current('system', 'MIDI status: Offline. Search for MIDI hardware...');
            }
          };

          updateMidiDevices();

          const handleMidiMessage = (event: any) => {
            const [status, noteNumber, velocity] = event.data;
            const command = status & 0xf0;

            const midiNumToNoteName = (midiNum: number): string => {
              const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
              const index = midiNum % 12;
              const noteOctave = Math.floor(midiNum / 12) - 1;
              return `${notes[index]}${noteOctave}`;
            };

            const noteName = midiNumToNoteName(noteNumber);

            if (command === 0x90 && velocity > 0) {
              const normalizedVelocity = velocity / 127;
              onNoteOnRef.current(noteName, normalizedVelocity);
            } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
              onNoteOffRef.current(noteName);
            }
          };

          const setupMidiInputs = () => {
            for (const input of access.inputs.values()) {
              input.onmidimessage = handleMidiMessage;
            }
          };

          setupMidiInputs();

          access.onstatechange = () => {
            updateMidiDevices();
            setupMidiInputs();
          };
        })
        .catch((error) => {
          onLogRef.current('error', `Failed to obtain Web MIDI access: ${error.message}`);
        });
    } else {
      onLogRef.current('system', 'Web MIDI is not supported on this browser.');
    }
  }, []);

  return { midiConnected, midiDeviceName };
};
