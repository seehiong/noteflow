import React, { useState } from 'react';
import { Settings, Save, RotateCcw } from 'lucide-react';

interface KeyboardMapping {
  [key: string]: { note: string; octave: number };
}

interface KeyboardSettingsProps {
  mapping: KeyboardMapping;
  onMappingChange: (mapping: KeyboardMapping) => void;
}

const defaultRows = [
  { keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i'], label: 'QWERTY Row' },
  { keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k'], label: 'ASDF Row' },
  { keys: ['z', 'x', 'c', 'v', 'b', 'n', 'm', ','], label: 'ZXCV Row' }
];

const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'];
const solfege = ['do', 're', 'mi', 'fa', 'so', 'la', 'ti', 'do'];

export const KeyboardSettings: React.FC<KeyboardSettingsProps> = ({ 
  mapping, 
  onMappingChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempMapping, setTempMapping] = useState<KeyboardMapping>(mapping);

  const updateRowOctave = (rowIndex: number, octave: number) => {
    const newMapping = { ...tempMapping };
    const row = defaultRows[rowIndex];
    
    row.keys.forEach((key, noteIndex) => {
      const finalOctave = noteIndex === 7 ? octave + 1 : octave; // Last note is next octave
      newMapping[key] = { note: notes[noteIndex], octave: finalOctave };
    });
    
    setTempMapping(newMapping);
  };

  const saveMapping = () => {
    onMappingChange(tempMapping);
    setIsOpen(false);
  };

  const resetToDefault = () => {
    const defaultMapping: KeyboardMapping = {};
    
    // QWERTY row - Octave 3-4
    defaultRows[0].keys.forEach((key, index) => {
      const octave = index === 7 ? 4 : 3;
      defaultMapping[key] = { note: notes[index], octave };
    });
    
    // ASDF row - Octave 4-5
    defaultRows[1].keys.forEach((key, index) => {
      const octave = index === 7 ? 5 : 4;
      defaultMapping[key] = { note: notes[index], octave };
    });
    
    // ZXCV row - Octave 5-6
    defaultRows[2].keys.forEach((key, index) => {
      const octave = index === 7 ? 6 : 5;
      defaultMapping[key] = { note: notes[index], octave };
    });
    
    setTempMapping(defaultMapping);
  };

  const getCurrentRowOctave = (rowIndex: number): number => {
    const firstKey = defaultRows[rowIndex].keys[0];
    return tempMapping[firstKey]?.octave || 3 + rowIndex;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
      >
        <Settings className="w-4 h-4" />
        Keyboard Settings
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Keyboard Mapping Settings</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {defaultRows.map((row, rowIndex) => {
            const currentOctave = getCurrentRowOctave(rowIndex);
            
            return (
              <div key={rowIndex} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-white">{row.label}</h4>
                  <div className="flex items-center gap-2">
                    <label className="text-purple-300 text-sm">Base Octave:</label>
                    <select
                      value={currentOctave}
                      onChange={(e) => updateRowOctave(rowIndex, parseInt(e.target.value))}
                      className="bg-slate-600 text-white rounded px-2 py-1 text-sm"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map(oct => (
                        <option key={oct} value={oct}>{oct}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-8 gap-2">
                  {row.keys.map((key, noteIndex) => {
                    const mapping = tempMapping[key];
                    const displayOctave = noteIndex === 7 ? currentOctave + 1 : currentOctave;
                    
                    return (
                      <div key={key} className="text-center">
                        <div className="bg-white text-gray-800 w-10 h-10 rounded flex items-center justify-center font-bold text-sm mb-1">
                          {key.toUpperCase()}
                        </div>
                        <div className="text-xs text-purple-200">
                          <div className="font-medium">{notes[noteIndex]}{displayOctave}</div>
                          <div className="text-purple-300 italic">{solfege[noteIndex]}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={saveMapping}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
          
          <button
            onClick={resetToDefault}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Default
          </button>
          
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="mt-4 text-sm text-purple-300">
          <p>• Each row can be set to a different base octave</p>
          <p>• The last key in each row (I, K, comma) plays the next octave's "do"</p>
          <p>• Hold Shift for sharps (#) or Ctrl for flats (♭)</p>
        </div>
      </div>
    </div>
  );
};