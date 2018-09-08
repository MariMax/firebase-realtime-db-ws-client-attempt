const activeTasks = [];
const left = document.querySelector('.gate-left');
const right = document.querySelector('.gate-right');
const loop = document.querySelector('.loop');
let gateClosed = false;
let taskClosed = false;

const socket = io.connect('wss://web-ar-e1c34.firebaseio.com/');
socket.on('HEY', (data) => {
  for (let i = 0; i < data.activeTasks; i++) {
    addTask();
  }
  if(data.activeTasks > 0) left.classList.add('open');
  if(data.right) right.classList.add('open');
  console.log('hey');
});


const loopR = {
  y: 80,
};
const loopL = {
  y: -80,
};
const taskP = {
  x: [-30, -40, 40, 30],
  y: [0, -40, -40, 0],
};
const rightP = {
  x: [30, 40, -40, -30],
  y: [0, 40, 40, 0],
};

function addTask() {
  if (activeTasks.length > 5) return;
  
  const svg = document.querySelector('svg');
  const newElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path',
  ); //Create a path in SVG's namespace
  newElement.setAttribute(
    'd',
    `M66 ${140 - 25 * activeTasks.length} A 40 40, 0, 0, 0, 66 ${160 -
      25 * activeTasks.length}`,
  ); //Set path's data
  newElement.classList.add('task');
  if (activeTasks.length === 0) {
    newElement.classList.add('active');
  }
  svg.appendChild(newElement);
  activeTasks.unshift({task: newElement, number: activeTasks.length, translate: 0});
}

document.addEventListener('click', e => {
  if (e.target === add) {
    socket.emit('ADD_TASK');
  }
  if (e.target === rightG) {
    socket.emit('OPEN_RIGHT');
  }
});

socket.on('ADD_TASK', () => {
  addTask();
  socket.emit('OPEN_LEFT');
});

socket.on('CLOSE_LEFT', () => {
  left.classList.remove('open');
});

socket.on('OPEN_LEFT', () => {
  left.classList.add('open');
});

socket.on('CLOSE_RIGHT', () => {
  right.classList.remove('open');
});

socket.on('OPEN_RIGHT', () => {
  right.classList.add('open');
});

socket.on('COMPLETE_TASK', () => {
  const lasTast = activeTasks.pop();
  lasTast.task.parentNode.removeChild(lasTast.task);
  if (activeTasks.length === 0) socket.emit('CLOSE_LEFT');
  activeTasks.forEach((i, index) => {
    i.number--;
    i.translate +=25;
    i.task.style.transform = `translateY(${i.translate}px) translateX(${index === activeTasks.length - 1 ? '15px' : '0' })`;
  });
});

function rotateLoop() {
  let route = right.classList.contains('open') ? rightP : loopR;
  let endPosition = 1;
  let coords = {x: 0, y: 0};
  const tweenX = new TWEEN.Tween({x: 0, y: 0})
    .to({...route}, 1000)
    .onUpdate(progress => {
      if (route === loopR) {
        coords = {
          x: 40 * Math.cos((progress / 2) * Math.PI * 2 - Math.PI / 2),
          y: 40 * Math.sin((progress / 2) * Math.PI * 2 - Math.PI / 2) + 40,
        };
      }
      if (route === loopL) {
        coords = {
          x: 40 * Math.cos((progress / 2) * Math.PI * 2 + Math.PI / 2),
          y: 40 * Math.sin((progress / 2) * Math.PI * 2 + Math.PI / 2) + 40,
        };
      }

      if (route === rightP && progress > 0.17 && progress < 0.83) {
        const x = (progress - 0.17) / 0.66;
        coords = {
          x: 30 + 40 * Math.cos((x / 2) * Math.PI * 2 - Math.PI / 2),
          y: 40 * Math.sin((x / 2) * Math.PI * 2 - Math.PI / 2) + 40,
        };
        if (progress > .5 && !gateClosed) {
          gateClosed = true;
          socket.emit('CLOSE_RIGHT')
        } 

      }
      if (route === rightP && progress < 0.17) {
        const x = progress / 0.17;
        coords = {x: x * 30, y: coords.y};
      }
      if (route === rightP && progress > 0.83) {
        const x = (progress - 0.83) / 0.17;
        coords = {x: 30 - x * 30, y: coords.y};
      }

      if (route === taskP && progress > 0.17 && progress < 0.83) {
        const x = (progress - 0.17) / 0.66;
        coords = {
          x: -30 + 40 * Math.cos((x / 2) * Math.PI * 2 + Math.PI / 2),
          y: 40 * Math.sin((x / 2) * Math.PI * 2 + Math.PI / 2) + 40,
        };
        if (progress > .5 && !taskClosed) {
          taskClosed = true;
          socket.emit('COMPLETE_TASK')
        } 
      }
      if (route === taskP && progress < 0.17) {
        const x = progress / 0.17;
        coords = {x: -x * 30, y: coords.y};
      }
      if (route === taskP && progress > 0.83) {
        const x = (progress - 0.83) / 0.17;
        coords = {x: -30 + x * 30, y: coords.y};
      }

      loop.style.setProperty(
        'transform',
        'translate(' + coords.x + 'px, ' + coords.y + 'px)',
      );
    })
    .onComplete(() => {
      gateClosed = false;
      taskClosed = false;
      if (endPosition === 1) {
        route = left.classList.contains('open') ? taskP : loopL;
        endPosition = 0;
      } else {
        endPosition = 1;
        route = right.classList.contains('open') ? rightP : loopR;
      }
      tweenX.to({...route});
      tweenX.start();
    })
    .start();
}
rotateLoop();

// Setup the animation loop.
function animate(time) {
  requestAnimationFrame(animate);
  TWEEN.update(time);
}
requestAnimationFrame(animate);
