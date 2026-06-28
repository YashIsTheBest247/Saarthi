// Lightweight, dependency-free confetti burst via the Web Animations API.
export function confetti(count = 90) {
  const colors = ["#2E3A7B", "#C0453B", "#1F7A55", "#C2641F", "#2D6BFF", "#A06A1F"];
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    const size = 6 + Math.random() * 7;
    el.style.cssText = `position:fixed;z-index:9999;top:-12px;left:${Math.random() * 100}vw;width:${size}px;height:${size}px;background:${colors[i % colors.length]};border-radius:${Math.random() > 0.5 ? "50%" : "2px"};pointer-events:none`;
    document.body.appendChild(el);
    const x = (Math.random() - 0.5) * 340;
    const rot = Math.random() * 900;
    el.animate(
      [
        { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
        { transform: `translate(${x}px, ${window.innerHeight + 60}px) rotate(${rot}deg)`, opacity: 1 },
      ],
      { duration: 1700 + Math.random() * 1300, easing: "cubic-bezier(.2,.6,.4,1)" },
    ).onfinish = () => el.remove();
  }
}
