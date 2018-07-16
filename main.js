const planetData = [
  {
    color: 'gold',
    radius: 40,
    start_angle: 0,
    apsis: 0,
    velocity: 0,
  },
  {
    color: 'red',
    radius: 6,
    start_angle: 0,
    apsis: 150,
    velocity: 0.005,
  },
  {
    color: 'lightyellow',
    radius: 15,
    start_angle: 0,
    apsis: 300,
    velocity: 0.004,
  },
];

class Planet {
  constructor(props) {
    this.props = props;
    // Override with props
    for (let prop in props) {
      this[prop] = props[prop];
    }
    this.angle = this.props.start_angle;
  }

  getAngle(time) {
    return this.angle += this.velocity * time;
  }

  getPosition(angle) {
    const { apsis } = this.props;
    const center = {
      x: width / 2,
      y: height / 2
    };
    return {
      x: apsis * Math.cos(angle) + center.x,
      y: apsis * Math.sin(angle) + center.y
    };
  }

  draw(time) {
    const { context, radius, color } = this.props;
    const angle = this.getAngle(time);
    const { x, y } = this.getPosition(angle);
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
  planets.forEach(d => d.draw(timeSinceLastRun));
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

// Establish some global mutable values
let req,
  width = window.innerWidth,
  height = window.innerHeight,
  startTime = 0,
  previousTime = 0;

// The canvas rendered to the page:
const [canvas, context] = createCanvas();
// A virtual canvas for pre-rendering, to improve perf
// (See https://www.html5rocks.com/en/tutorials/canvas/performance/#toc-pre-render)
const [m_canvas, m_context] = createCanvas();

// Initialise
window.onload = initialise;
