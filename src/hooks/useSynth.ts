//src/hooks/useSynth.ts

import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioEngine } from '../utils/AudioEngine';

export const useSynth = (
  addConsoleLog: (type: 'system' | 'input-on' | 'input-off' | 'error', message: string) => void
) => {
  const audioEngineRef = useRef<AudioEngine | null>(null);

  const [synthType, setSynthType] = useState<string>('piano');
  const [attack, setAttack] = useState<number>(0.01);
  const [decay, setDecay] = useState<number>(0.15);
  const [sustain, setSustain] = useState<number>(0.6);
  const [release, setRelease] = useState<number>(0.25);
  const [reverbLevel, setReverbLevel] = useState<number>(0.3);
  const [volume, setVolume] = useState(0.7);

  useEffect(() => {
    audioEngineRef.current = new AudioEngine();
    audioEngineRef.current.setMasterVolume(volume);
    return () => {
      audioEngineRef.current?.dispose();
    };
  }, []);

  // Update ADSR sliders to preset defaults when changing instrument types
  useEffect(() => {
    const instrumentAdsr: { [key: string]: { attack: number; decay: number; sustain: number; release: number } } = {
      piano: { attack: 0.004, decay: 0.9, sustain: 0.18, release: 0.35 },
      organ: { attack: 0.025, decay: 0.06, sustain: 0.95, release: 0.12 },
      flute: { attack: 0.07, decay: 0.12, sustain: 0.8, release: 0.18 },
      cello: { attack: 0.16, decay: 0.25, sustain: 0.8, release: 0.3 },
      violin: { attack: 0.12, decay: 0.2, sustain: 0.85, release: 0.3 },
      sine: { attack: 0.01, decay: 0.15, sustain: 0.6, release: 0.25 },
      triangle: { attack: 0.01, decay: 0.15, sustain: 0.6, release: 0.25 },
      square: { attack: 0.01, decay: 0.15, sustain: 0.6, release: 0.25 },
      sawtooth: { attack: 0.01, decay: 0.15, sustain: 0.6, release: 0.25 },
      drum: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 }
    };

    const preset = instrumentAdsr[synthType];
    if (preset) {
      setAttack(preset.attack);
      setDecay(preset.decay);
      setSustain(preset.sustain);
      setRelease(preset.release);
    }
  }, [synthType]);

  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.setSynthType(synthType);
      audioEngineRef.current.setAdsr(attack, decay, sustain, release);
      audioEngineRef.current.setReverbLevel(reverbLevel);
    }
  }, [synthType, attack, decay, sustain, release, reverbLevel]);

  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.setMasterVolume(volume);
    }
  }, [volume]);

  const handleResetSynth = useCallback(() => {
    setSynthType('piano');
    setAttack(0.01);
    setDecay(0.15);
    setSustain(0.6);
    setRelease(0.25);
    setReverbLevel(0.3);
    setVolume(0.7);
    addConsoleLog('system', 'Reset synthesizer parameters to default settings.');
  }, [addConsoleLog]);

  return {
    audioEngineRef,
    synthType,
    setSynthType,
    attack,
    setAttack,
    decay,
    setDecay,
    sustain,
    setSustain,
    release,
    setRelease,
    reverbLevel,
    setReverbLevel,
    volume,
    setVolume,
    handleResetSynth,
  };
};
