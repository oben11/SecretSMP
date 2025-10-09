export function bubble(x,y, mii) {
    let enabled = true;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;
    mii.container.appendChild(bubble);

    const button = document.createElement('button');
    button.textContent = 'X';
    bubble.appendChild(button);

    const onDocClick = (e) => {
        if (!enabled) return;
        if (!bubble.contains(e.target)) {
            enabled = false;
            document.removeEventListener('click', onDocClick);
            bubble.remove();
            mii.unselect();
        }
    };

    button.addEventListener('click', (e) => {
        if (!enabled) return;
        enabled = false;
        document.removeEventListener('click', onDocClick);
        bubble.remove();
        mii.unselect();
        e.stopPropagation();
    });

    document.addEventListener('click', onDocClick);

}

export default bubble;