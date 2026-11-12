# NoteFlow - MIDI IDE and Keyboard Synthesizer

## 🚀 [Live Demo](https://seehiong.github.io/noteflow/)

**Try it now!** Click the link above to start writing, playing, and recording music in the browser - no installation required!

---

A beautiful, interactive web-based **MIDI IDE (Integrated Development Environment)** and synthesizer that lets you compile, play, and record music notes using your computer keyboard, mouse, or hardware MIDI keyboards. Perfect for learning piano, composing melodies, and testing synthesizers.

![MIDI Keyboard Player](https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## 🖥️ JAMStack Architecture

NoteFlow is built using the modern **JAMStack** (JavaScript, APIs, Markup) architecture:
- **JavaScript (TypeScript & React 18)**: Powering the reactive layout, state management, note transcription, and sound design fully client-side.
- **APIs**: Leverages native, client-only browser APIs including the **Web Audio API** for real-time sound synthesis (oscillators, reverb filters, envelope gains) and the **Web MIDI API** for interfacing directly with physical keyboards.
- **Markup**: Compiled statically via **Vite** and served directly from **GitHub Pages** CDN edges. There is no active server-side runtime needed, ensuring low latency, high scalability, and simple hosting.

---

## ✨ Features

### 💻 MIDI Code Editor (IDE) & Orchestrator
- **NoteFlow Notation Language (NFN)**: Write notes using simple tokens like `C4/1` or `rest/0.5`.
- **🎼 Multi-Track Orchestration**: Write up to 16 parallel tracks playing together. Prefix lines with a track ID and an instrument/synth type using `synth=` or `instrument=` (e.g., `T1 instrument=flute C4/1` and `T2 synth=cello C3/2` play melody and bassline in parallel).
  - **Supported Instruments**: `piano`, `organ`, `flute`, `cello`, `sine`, `triangle`, `square`, `sawtooth`, `drum`.
- **Live Compiler**: Automatically compiles code as you type and renders track `T1`'s melody on the visual staff.
- **File I/O Export**: Import local files using the **Upload (.noteflow)** button or export your compositions using the **Download (.noteflow)** button.
- **Code Validation**: Displays helpful compiler status alerts and points out syntax errors in real-time.
- **Save Workspace**: Automatically saves your custom edits to browser local storage.

### 🎛️ ADSR Synthesizer & Sound Controls
- **Waveform Selector & Instruments**: Choose wave shapes and instruments (Classic Harmonics Piano, Pipe Organ, Woodwind Flute, Bowed Cello, Sine, Triangle, Square, Sawtooth, and Synthesized Drums) for free play or text tracks.
- **ADSR Envelope Controls**: Fine-tune Attack time, Decay time, Sustain multiplier, and Release time to customize the instrument envelope.
- **Reverb Effect**: An impulse response convolver node simulation to add spatial echo and depth.
- **Parameters Tooltips & Reset**: Hover over the `(i)` icons next to controls to read descriptions, or click **Reset** to restore default parameters.

### 🥁 Synthesized Drum Kit
- **Native Drum Engine**: Synthesizes realistic percussion sounds fully client-side:
  - **Bass Drum (BD/Kick):** Dynamic frequency drop from 150Hz.
  - **Snare Drum (SD/Snare):** Fuses a triangle core body note with highpass-filtered white noise.
  - **Hi-Hat (HH/Hihat):** Trigger-and-forget short noise bursts.
- **Interactive Drum Pad:** Select "Synthesized Drum Kit" from the waveform dropdown to play drums live using piano or computer keys.

### 🎙️ Live MIDI Recorder & Quantizer
- **Recording Engine**: Record notes played in real-time via virtual keys, QWERTY keys, or external hardware.
- **Smart Quantization**: Automatically rounds note durations to the nearest common values (`0.25`, `0.5`, `1`, `1.5`, `2`, `4`).
- **Rest Auto-Detection**: Detects pauses, appending rest commands (e.g. `rest/0.5`) in the code workspace.

### ⌨️ Web MIDI & Keyboard Mapping
- **Web MIDI API Support**: Plug in physical MIDI keyboards/electronic pianos. They are automatically mapped, logged, and active.
- **Developer Event Console**: Live ticker output showing Note On, Note Off, and Velocity events with origin tags (keystroke, virtual press, hardware).
- **QWERTY Mapping**: Play scales using standard keyboard rows (QWERTY, ASDF, ZXCV). Hold **Shift** for sharps (#) and **Alt/Option** for flats (♭).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- A modern browser supporting Web Audio and Web MIDI APIs (e.g., Google Chrome, Microsoft Edge, Opera)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/seehiong/noteflow
   cd noteflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173/noteflow/` to launch the IDE!

### Test on a phone over local HTTPS (Windows)

To use Web Audio from a phone without browser certificate warnings, install [mkcert](https://github.com/FiloSottile/mkcert), then run these commands from the project folder in PowerShell. Replace `192.168.168.168` with your PC's current Wi-Fi IPv4 address:

```powershell
mkcert -install
New-Item -ItemType Directory -Force .certs
mkcert -cert-file .certs/dev-cert.pem -key-file .certs/dev-key.pem 192.168.168.168 localhost 127.0.0.1 ::1
Copy-Item "$(mkcert -CAROOT)\rootCA.pem" public/dev-rootCA.pem
openssl x509 -in public/dev-rootCA.pem -outform DER -out public/dev-rootCA.cer
npm run dev:lan
```

On the iPhone, visit `https://<PC-WI-FI-IP>:5173/noteflow/dev-rootCA.cer` and accept Safari's warning just long enough to download the certificate. Install it from **Settings → Profile Downloaded**, then go to **Settings → General → About → Certificate Trust Settings** and enable full trust for the mkcert root. Finally, open `https://<PC-WI-FI-IP>:5173/noteflow/`. Keep the phone and PC on the same Wi-Fi network and allow Node.js through Windows Firewall on private networks. The `.certs` private key and generated CA files are excluded from Git.

---

## 🎮 How to Use the IDE

### Writing and Playing Multi-Track Melodies
1. Choose **Mini Symphony**, **Rock Twinkle**, **Chamber Duet**, or **Jingle Bells Metal** from the Melodies Explorer in the sidebar.
2. Examine the parallel track structures:
   - Lines start with a track header using either `synth=` or `instrument=` (e.g., `T1 instrument=flute`, `T2 synth=cello`, `T3 synth=drum`).
   - Note tokens are separated by spaces: `[Pitch]/[Beats]` (e.g., `C4/1.5`, `rest/0.5`, `BD/1`).
3. Click **Compile & Play** to compile and orchestrate all tracks in parallel.
4. Alter synthesizer ADSR sliders to mold sound waves in real-time. Hover over the info `(i)` icons next to sliders to read parameter guides, or click **Reset** to restore defaults.
5. Export your composition using **Download** (saved as `.noteflow`), or load custom files using **Upload**.

### Recording Live Music
1. Turn on the **Metronome** and set your desired **BPM**.
2. Click the **Record MIDI** button.
3. Play notes on your QWERTY keyboard, on-screen keys, or external MIDI controller.
4. NoteFlow will automatically append quantized tokens (e.g., `E4/0.5`, `rest/1`) into the editor.
5. Click **Record** again to stop. You can now edit, download, and replay your performance!

---

## 🛠️ Project Structure

```
src/
├── components/          
│   ├── Piano.tsx            # Interactive virtual piano keys
│   ├── MusicalScore.tsx     # Scrolling sheet music staff visualizer (melodic track T1)
│   ├── KeyboardSettings.tsx # QWERTY keyboard octave layout settings
│   ├── SynthSettings.tsx    # Waveform and ADSR parameter sliders card
│   ├── MelodyExplorer.tsx   # Sidebar built-in songs list card
│   ├── NoteEditor.tsx       # Notation compiler editor & validation console
│   └── MidiConsole.tsx      # Terminal event logs panel
├── hooks/              
│   ├── useSynth.ts          # State and hook wrapper for AudioEngine setup
│   ├── useWebMidi.ts        # Browser external midi inputs handler
│   └── useQwertyKeyboard.ts # Window keypress layout mappings
├── utils/              
│   ├── AudioEngine.ts       # Web Audio synthesizer with ADSR, Reverb, and Percussion Kit
│   ├── MidiRecorder.ts      # Live note duration quantization engine
│   ├── musicUtils.ts        # Pitch enharmonic converters
│   └── noteMapping.ts       # Computer QWERTY mapping configurations
├── data/               
│   └── sampleSongs.ts       # Built-in melodies
└── App.tsx                  # Main IDE layout dashboard
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

---

**Happy Coding & Playing! 🎹🚀**
