// Variables globales para almacenar el dibujo



let drawing = [];
let isDrawing = false;
let liveSynth;
let currentColor = '#1e90ff';
let currentThickness = 4;
let currentOpacity = 1;
let rainbowMode = false;
let instrumentType = 'Synth';
let hue = 0;




function setup() {
    let canvas = createCanvas(windowWidth * 0.97, windowHeight * 0.8);
    canvas.parent('canvas-container');
    background(255);
    liveSynth = new Tone[instrumentType]().toDestination();
}




function draw() {
    if (isDrawing) {
        let colorToUse = currentColor;
        if (rainbowMode) {
            colorMode(HSB);
            colorToUse = color(hue % 360, 80, 100, currentOpacity);
            hue += 2;
            colorMode(RGB);
        } else {
            colorToUse = color(currentColor);
            colorToUse.setAlpha(currentOpacity * 255);
        }
        stroke(colorToUse);
        strokeWeight(currentThickness);
        drawing.push({ x: mouseX, y: mouseY, color: colorToUse.toString(), thickness: currentThickness, opacity: currentOpacity });
        line(pmouseX, pmouseY, mouseX, mouseY);

        // Sonar nota en tiempo real
        let note = map(mouseY, 0, height, 72, 48); // MIDI: C5 a C4
        if (Tone.context.state !== 'running') {
            // No hacer nada si el contexto no está iniciado
            return;
        }
        liveSynth.triggerAttackRelease(Tone.Frequency(note, 'midi'), 0.08);
    }
}




function mousePressed() {
    // Solo permitir dibujar si el mouse está sobre el canvas
    const canvasRect = document.getElementById('canvas-container').getBoundingClientRect();
    if (
        mouseX >= 0 && mouseX <= width &&
        mouseY >= 0 && mouseY <= height &&
        mouseX + canvasRect.left < canvasRect.right &&
        mouseY + canvasRect.top < canvasRect.bottom
    ) {
        isDrawing = true;
        Tone.start(); // Asegura que el contexto de audio esté iniciado
    }
}



function mouseReleased() {
    isDrawing = false;
}

// Si el mouse sale del canvas, dejar de dibujar
document.getElementById('canvas-container').addEventListener('mouseleave', () => {
    isDrawing = false;
});

// Prevenir que los botones de la barra lateral activen el dibujo
const sidebar = document.querySelector('.sidebar');
if (sidebar) {
    sidebar.addEventListener('mouseenter', () => { isDrawing = false; });
}

// Deshabilitar botones de extras que no están implementados
['randomColor','eraser','mirror','spray'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
        btn.disabled = true;
        btn.title = 'Próximamente';
        btn.style.opacity = 0.5;
        btn.style.cursor = 'not-allowed';
    }
});


// Cambiar color del trazo
document.getElementById('colorPicker').addEventListener('input', (e) => {
    currentColor = e.target.value;
});

// Cambiar grosor
document.getElementById('thickness').addEventListener('input', (e) => {
    currentThickness = parseInt(e.target.value);
});

// Cambiar opacidad
document.getElementById('opacity').addEventListener('input', (e) => {
    currentOpacity = parseFloat(e.target.value);
});

// Modo arcoíris
document.getElementById('rainbow').addEventListener('change', (e) => {
    rainbowMode = e.target.checked;
});

// Cambiar instrumento
document.getElementById('instrument').addEventListener('change', (e) => {
    instrumentType = e.target.value;
    liveSynth = new Tone[instrumentType]().toDestination();
});

// Limpiar canvas
document.getElementById('clear').addEventListener('click', () => {
    background(255);
    drawing = [];
});



// Reproducir el dibujo como sonido
function playDrawing() {
    if (drawing.length === 0) return;
    const synth = new Tone[instrumentType]().toDestination();
    let now = Tone.now();
    for (let i = 0; i < drawing.length; i += 10) {
        let note = map(drawing[i].y, 0, height, 72, 48); // MIDI: C5 a C4
        synth.triggerAttackRelease(Tone.Frequency(note, 'midi'), 0.1, now + (i / 100));
    }
    // Redibujar el trazo con sus colores y grosores
    background(255);
    for (let i = 1; i < drawing.length; i++) {
        stroke(drawing[i].color || '#1e90ff');
        strokeWeight(drawing[i].thickness || 4);
        line(drawing[i-1].x, drawing[i-1].y, drawing[i].x, drawing[i].y);
    }
}

// Hacer el canvas responsivo
function windowResized() {
    resizeCanvas(windowWidth * 0.97, windowHeight * 0.8);
    background(255);
    // Redibujar el trazo
    for (let i = 1; i < drawing.length; i++) {
        stroke(drawing[i].color || '#1e90ff');
        strokeWeight(drawing[i].thickness || 4);
        line(drawing[i-1].x, drawing[i-1].y, drawing[i].x, drawing[i].y);
    }
}

document.getElementById('play').addEventListener('click', async () => {
    await Tone.start(); // Necesario para iniciar el contexto de audio
    playDrawing();
});
