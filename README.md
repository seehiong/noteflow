# MIDI Keyboard Player with Computer Key Mapping

A beautiful, interactive web-based piano application that lets you play music using your computer keyboard or mouse. Perfect for learning piano, practicing songs, and exploring musical creativity.

![MIDI Keyboard Player](https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## ✨ Features

### 🎹 Virtual Piano
- **88-key piano interface** with realistic white and black keys
- **Visual feedback** with purple highlighting when keys are pressed
- **Mouse interaction** - click keys to play notes
- **Multiple octaves** spanning from C3 to C6

### ⌨️ Computer Keyboard Mapping
- **Play with your keyboard** - no MIDI controller needed!
- **Customizable key mapping** - assign any keyboard row to any octave
- **Three keyboard rows** for different octaves:
  - QWERTY row (default: Octave 3-4)
  - ASDF row (default: Octave 4-5) 
  - ZXCV row (default: Octave 5-6)
- **Modifier keys**:
  - Hold **Shift** for sharps (#)
  - Hold **Ctrl** for flats (♭)

### 🎵 Sample Songs & Practice Mode
- **5 built-in songs**:
  - Happy Birthday
  - Twinkle Twinkle Little Star
  - Mary Had a Little Lamb
  - Ode to Joy
  - Jingle Bells

### 🎯 Interactive Learning
- **Listen Mode**: Hear songs play automatically
- **Practice Mode**: Interactive learning with note-by-note guidance
- **Musical Score Display**: See notes in standard musical notation
- **Progress Tracking**: Visual progress bar and note counter
- **Auto-scroll**: Keeps current note centered in the score view

### 🔧 Advanced Features
- **Volume Control**: Adjustable audio volume
- **Keyboard Settings**: Fully customizable key-to-note mapping
- **Audio Engine**: Web Audio API for high-quality sound synthesis
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- Modern web browser with Web Audio API support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd midi-keyboard-player
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
   Navigate to `http://localhost:5173` to start playing!

## 🎮 How to Use

### Basic Playing
1. **Use your keyboard**: Press Q, W, E, R, T, Y, U, I for a C major scale
2. **Click the piano**: Use your mouse to click virtual piano keys
3. **Adjust volume**: Use the volume slider to control audio level

### Learning Songs
1. **Select a song**: Click any song button in the left sidebar
2. **Choose mode**:
   - **Listen Mode**: Click "Play" to hear the song
   - **Practice Mode**: Click the mute button to enter interactive practice
3. **Follow along**: In practice mode, play the highlighted red notes to progress

### Getting Help
- **Stuck on a note?** Click the bouncing red note to see which keyboard keys to press
- **Need different mapping?** Click "Keyboard Settings" to customize your layout

### Keyboard Mapping Customization
1. Click **"Keyboard Settings"** button
2. **Set octaves** for each keyboard row:
   - QWERTY row → Choose base octave (1-7)
   - ASDF row → Choose base octave (1-7)
   - ZXCV row → Choose base octave (1-7)
3. **Preview mapping** - see exactly which keys play which notes
4. **Save settings** or reset to defaults

## 🎼 Musical Features

### Note System
- **Standard notation**: Uses traditional note names (C, D, E, F, G, A, B)
- **Solfege support**: Shows do, re, mi, fa, so, la, ti for educational purposes
- **Octave range**: Covers multiple octaves for full musical expression

### Audio Engine
- **Web Audio API**: High-quality, low-latency audio synthesis
- **Sine wave oscillators**: Clean, pure tones perfect for learning
- **Real-time processing**: Immediate audio feedback with no delay

### Practice Mode Benefits
- **Note-by-note learning**: Progress only when you play the correct note
- **Visual guidance**: Clear highlighting of current note to play
- **Audio feedback**: Hear your playing to develop ear training
- **Completion tracking**: See your progress through each song

## 🛠️ Technical Stack

- **React 18** with TypeScript for robust component architecture
- **Vite** for fast development and building
- **Tailwind CSS** for beautiful, responsive styling
- **Lucide React** for crisp, modern icons
- **Web Audio API** for professional audio synthesis
- **ESLint** for code quality and consistency

## 🎨 Design Philosophy

- **Apple-level aesthetics**: Clean, sophisticated visual design
- **Intuitive UX**: Natural interactions that feel familiar
- **Responsive layout**: Optimized for all screen sizes
- **Accessibility**: High contrast ratios and keyboard navigation
- **Performance**: Smooth animations and responsive audio

## 📱 Browser Compatibility

- **Chrome/Chromium**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

*Note: Requires Web Audio API support (available in all modern browsers)*

## 🎯 Learning Tips

### For Beginners
1. **Start with simple songs** like "Twinkle Twinkle Little Star"
2. **Use practice mode** to learn note by note
3. **Click notes for hints** when you're stuck
4. **Customize keyboard mapping** to match your comfort level

### For Advanced Users
1. **Try complex songs** like "Ode to Joy"
2. **Use different octaves** by customizing keyboard rows
3. **Practice with sharps and flats** using Shift and Ctrl modifiers
4. **Challenge yourself** by turning off auto-scroll

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── components/          # React components
│   ├── Piano.tsx       # Virtual piano interface
│   ├── MusicalScore.tsx # Musical notation display
│   ├── KeyboardSettings.tsx # Keyboard mapping configuration
│   ├── KeyboardHint.tsx # Practice mode hints
│   └── SampleSongs.tsx # Song selection (removed in compact layout)
├── utils/              # Utility functions
│   ├── AudioEngine.ts  # Web Audio API wrapper
│   └── noteMapping.ts  # Keyboard-to-note mapping logic
├── data/               # Static data
│   └── sampleSongs.ts  # Song definitions
└── App.tsx            # Main application component
```

## 🎵 Adding New Songs

To add your own songs, edit `src/data/sampleSongs.ts`:

```typescript
export const sampleSongs = {
  "Your Song Name": {
    notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
    durations: [1, 1, 1, 1, 1, 1, 1, 2] // In beats
  }
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **Web Audio API** for enabling browser-based audio synthesis
- **React community** for excellent development tools
- **Tailwind CSS** for rapid, beautiful styling
- **Lucide** for clean, consistent icons

---

**Happy Playing! 🎹✨**

*Transform your computer into a musical instrument and start your piano learning journey today!*