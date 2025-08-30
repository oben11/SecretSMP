export function bubble(x,y, mii) {
    let enabled = true;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;
    document.body.appendChild(bubble);

    onclick = () => {
        if (!enabled) return;
        enabled = false;
        bubble.remove();
        mii.unselect();
    }

}

export default bubble;