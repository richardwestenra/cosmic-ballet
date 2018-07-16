// Global constants
const config = {
  speed: 0.001,
  apsis: 0.5,
  lineInterval: 80
};

const planetData = [
  {
    color: 'gold',
    radius: 20,
    start_angle: 0,
    apsis: 0,
    velocity: 0,
  },
  {
    color: 'red',
    radius: 5,
    start_angle: 0,
    apsis: 0.387,
    velocity: 1.59,
  },
  {
    color: 'lightyellow',
    radius: 12,
    start_angle: 0,
    apsis: 0.723,
    velocity: 1.18,
  },
];

// Global mutable values
let req,
  width = window.innerWidth,
  height = window.innerHeight,
  center = {
    x: width / 2,
    y: height / 2
  },
  lines = [],
  startTime = 0,
  previousTime = 0,
  timeSinceLastNewLine = 0;

/**
 * Create new Planet object, calculate its position, and draw it
 */
class Planet {
  constructor(props) {
    this.props = props;
    this.angle = this.props.start_angle;
  }

  updateAngle(time) {
    return this.angle += (this.props.velocity * time * config.speed);
  }

  updatePosition(angle) {
    const apsis = this.getApsis();
    return this.position = {
      x: apsis * Math.cos(angle) + center.x,
      y: apsis * Math.sin(angle) + center.y
    };
  }

  getApsis() {
    const apsisMultiplier = Math.min(width, height) * config.apsis;
    return this.apsis = Math.round(this.props.apsis * apsisMultiplier);
  }

  draw(time) {
    const { context, radius, color } = this.props;
    const angle = this.updateAngle(time);
    const { x, y } = this.updatePosition(angle);
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.strokeStyle = 'white';
    context.stroke();
    context.fillStyle = color;
    context.fill();
  }
}

/**
 * Create instances of the Area class
 */
const makePlanets = () => {
  planets = planetData.map((datum, id) => {
    return new Planet({
      id,
      context: m_context,
      ...datum
    });
  });
};

/**
 * Create new line between each planet
 */
class Line {
  constructor(props) {
    this.props = props;
    this.coordinates = this.getCoordinates();
  }

  getCoordinates() {
    return this.props.planets.map(d => {
      const { x, y } = d.position;
      return [x, y];
    });
  }

  draw() {
    const { context } = this.props;
    context.beginPath();
    context.moveTo(...this.coordinates[1]);
    context.lineTo(...this.coordinates[2]);
    context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    context.lineWidth = 2;
    context.stroke();
  }
}

const addNewLine = (timeSinceLastRun) => {
  timeSinceLastNewLine += timeSinceLastRun;

  while (timeSinceLastNewLine > config.lineInterval) {
    timeSinceLastNewLine -= config.lineInterval;
    lines.push(new Line({
      planets,
      context: m_context
    }));
  }
};

const drawPlanetPaths = planet => {
    const { x, y } = center;
    m_context.beginPath();
    m_context.arc(x, y, planet.apsis, 0, 2 * Math.PI);
    m_context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    m_context.lineWidth = 2;
    m_context.stroke();
};

/**
 * Calculate the total elapsed time since the start of the animation
 */
const updateClock = timestamp => {
  if (!startTime) {
    startTime = timestamp;
  }
  const totalElapsedTime = timestamp - startTime;
  const timeSinceLastRun = totalElapsedTime - previousTime;
  previousTime = totalElapsedTime;

  return timeSinceLastRun;
};

/**
 * Reset the canvas area for the next frame
 */
const clearCanvas = context => {
  context.fillStyle = '#111';
  context.rect(0, 0, width, height);
  context.fill();
};

/**
 * Execute a new animation frame and call the next one
 */
const run = timestamp => {
  clearCanvas(m_context);
  const timeSinceLastRun = updateClock(timestamp);
  addNewLine(timeSinceLastRun);
  lines.forEach(d => d.draw());
  planets.forEach(d => d.draw(timeSinceLastRun));
  planets.forEach(drawPlanetPaths);
  context.drawImage(m_canvas, 0, 0);
  req = requestAnimationFrame(run);
};


/**
 * Add event listeners
 */
const handleEvents = () => {
  // Update/redraw on window resize
  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    center = {
      x: width / 2,
      y: height / 2
    };
    [canvas, m_canvas].forEach(updateCanvasSize);
  });

  // Toggle (play/pause) animation on spacebar
  document.addEventListener('keydown', e => {
    if (e.keyCode !== 32) {
      return;
    }
    if (req) {
      cancelAnimationFrame(req);
      req = false;
    } else {
      req = requestAnimationFrame(run);
    }
  });
};


const createCanvas = () => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  updateCanvasSize(canvas);

  return [canvas, context];
};

const updateCanvasSize = canvas => {
  canvas.width = width;
  canvas.height = height;
};

/**
 * Start animation
 */
const initialise = () => {
  makePlanets();
  document.body.appendChild(canvas);
  req = requestAnimationFrame(run);
  handleEvents();
};

// The canvas rendered to the page:
const [canvas, context] = createCanvas();
// A virtual canvas for pre-rendering, to improve perf
// (See https://www.html5rocks.com/en/tutorials/canvas/performance/#toc-pre-render)
const [m_canvas, m_context] = createCanvas();

// Initialise
window.onload = initialise;
