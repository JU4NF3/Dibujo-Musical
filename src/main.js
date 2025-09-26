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
let eraserMode = false;
let sprayMode = false;




function setup() {
    let canvas = createCanvas(windowWidth * 0.97, windowHeight * 0.8);
    canvas.parent('canvas-container');
    background(255);
    liveSynth = new Tone[instrumentType]().toDestination();
}




function draw() {
    if (isDrawing) {
        let colorToUse = currentColor;
        let thicknessToUse = currentThickness;
        let opacityToUse = currentOpacity;
        if (eraserMode) {
            colorToUse = '#fff';
            opacityToUse = 1;
            thicknessToUse = currentThickness * 2.5;
        } else if (rainbowMode) {
            colorMode(HSB);
            colorToUse = color(hue % 360, 80, 100, opacityToUse);
            hue += 2;
            colorMode(RGB);
        } else {
            colorToUse = color(currentColor);
            colorToUse.setAlpha(opacityToUse * 255);
        }
        stroke(colorToUse);
        strokeWeight(thicknessToUse);
        if (sprayMode) {
            for (let i = 0; i < 20; i++) {
                let angle = random(TWO_PI);
                let radius = random(0, thicknessToUse * 2);
                let sx = mouseX + cos(angle) * radius;
                let sy = mouseY + sin(angle) * radius;
                point(sx, sy);
                drawing.push({ x: sx, y: sy, color: colorToUse.toString(), thickness: 1, opacity: opacityToUse });
            }
        } else {
            line(pmouseX, pmouseY, mouseX, mouseY);
            drawing.push({ x: mouseX, y: mouseY, color: colorToUse.toString(), thickness: thicknessToUse, opacity: opacityToUse });
        }

        // Simetría horizontal
        if (mirrorActive) {
            let mx = width - mouseX;
            let pmx = width - pmouseX;
            if (sprayMode) {
                for (let i = 0; i < 20; i++) {
                    let angle = random(TWO_PI);
                    let radius = random(0, thicknessToUse * 2);
                    let sx = mx + cos(angle) * radius;
                    let sy = mouseY + sin(angle) * radius;
                    point(sx, sy);
                    drawing.push({ x: sx, y: sy, color: colorToUse.toString(), thickness: 1, opacity: opacityToUse });
                }
            } else {
                line(pmx, pmouseY, mx, mouseY);
                drawing.push({ x: mx, y: mouseY, color: colorToUse.toString(), thickness: thicknessToUse, opacity: opacityToUse });
            }
        }

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
    // Permitir dibujar en todo el canvas de p5.js
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
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

// Extras: Color aleatorio
document.getElementById('randomColor').disabled = false;
document.getElementById('randomColor').title = 'Color aleatorio';
document.getElementById('randomColor').style.opacity = 1;
document.getElementById('randomColor').style.cursor = 'pointer';
document.getElementById('randomColor').addEventListener('click', () => {
    let randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    currentColor = randomColor;
    document.getElementById('colorPicker').value = randomColor;
});

// Extras: Borrador
const eraserBtn = document.getElementById('eraser');
eraserBtn.disabled = false;
eraserBtn.title = 'Borrador';
eraserBtn.style.opacity = 1;
eraserBtn.style.cursor = 'pointer';
eraserBtn.addEventListener('mousedown', () => {
    eraserMode = !eraserMode;
    eraserBtn.classList.toggle('active', eraserMode);
    // Desactivar spray si se activa borrador
    if (eraserMode) {
        sprayMode = false;
        sprayBtn.classList.remove('active');
    }
});

// Extras: Simetría horizontal
let mirrorActive = false;
const mirrorBtn = document.getElementById('mirror');
mirrorBtn.disabled = false;
mirrorBtn.title = 'Simetría Horizontal';
mirrorBtn.style.opacity = 1;
mirrorBtn.style.cursor = 'pointer';
mirrorBtn.addEventListener('mousedown', () => {
    mirrorActive = !mirrorActive;
    mirrorBtn.classList.toggle('active', mirrorActive);
});

// Extras: Spray
const sprayBtn = document.getElementById('spray');
sprayBtn.disabled = false;
sprayBtn.title = 'Spray';
sprayBtn.style.opacity = 1;
sprayBtn.style.cursor = 'pointer';
sprayBtn.addEventListener('mousedown', () => {
    sprayMode = !sprayMode;
    sprayBtn.classList.toggle('active', sprayMode);
    // Desactivar borrador si se activa spray
    if (sprayMode) {
        eraserMode = false;
        eraserBtn.classList.remove('active');
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
