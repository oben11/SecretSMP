document.addEventListener('DOMContentLoaded', () => {
    const primaryCursorPath = './media/cursors/primary.png';
    const secondaryCursorPath = './media/cursors/secondary.png';

    const customCursor = document.createElement('div');
    customCursor.classList.add('custom-cursor');
    document.body.appendChild(customCursor);

    const cursorImage = document.createElement('img');
    cursorImage.src = primaryCursorPath;
    cursorImage.classList.add('cursor-image');
    customCursor.appendChild(cursorImage);

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let cursorRotation = 0;


    const cursorSpeed = 0.15; 
    
    let animationFrameId = null;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const getRandomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const animate = () => {

        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;
        cursorX += (dx) * cursorSpeed;
        cursorY += (dy) * cursorSpeed;

        
        // Angle measured from upright (0 = up), positive towards left.
        //let deg = 30;
        if (dx <= 0 && (cursorRotation >= -35 * (Math.PI / 180))) {
            cursorRotation += -1 * (Math.PI / 180);
        } else if (dx >= 15 && (cursorRotation <= 0 * (Math.PI / 180))) {
            cursorRotation += 0.5 * (Math.PI / 180);
        }
        
        

        

        customCursor.style.transform = `translate(${cursorX}px, ${cursorY}px) rotate(${cursorRotation}rad)`;

        animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    const interactiveElements = document.querySelectorAll('a, button');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseover', () => {
            customCursor.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            customCursor.classList.remove('hover');
        });
    });
    
    document.addEventListener('mouseleave', () => {
        customCursor.style.opacity = '0';
    });

     document.addEventListener('mouseenter', () => {
        customCursor.style.opacity = '1';
    });

    window.addEventListener('mousedown', () => {
        cursorImage.src = secondaryCursorPath;
    });

    window.addEventListener('mouseup', () => {
        cursorImage.src = primaryCursorPath;
    });
});