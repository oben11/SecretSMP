export function bubble(x,y, mii) {
    let enabled = true;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;
    document.body.appendChild(bubble);

    const button = document.createElement('button');
    button.textContent = 'X';
    bubble.appendChild(button);

    onclick = () => {
        if (!enabled) return;
        enabled = false;
        bubble.remove();
        mii.unselect();
    }

}

export default bubble;