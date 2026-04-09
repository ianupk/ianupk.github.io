/* ── Reveal on scroll ─────────────────────────────── */
const revealItems = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 60, 300)}ms`;
    revealObserver.observe(item);
});

/* ── Navbar: transparent → tinted on scroll ──────── */
const header = document.getElementById("site-header");
const hero   = document.getElementById("hero");

function updateNavState() {
    if (!hero) return;
    header.classList.toggle("scrolled", hero.getBoundingClientRect().bottom <= 0);
}
window.addEventListener("scroll", updateNavState, { passive: true });
updateNavState();

/* ── Home button: always scrolls to absolute top ─── */
document.getElementById("nav-home").addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ── Art (D3) ─────────────────────────── */
function renderGenerativeArt() {
    if (typeof d3 === "undefined") return;
    const svg  = d3.select("#d3-art");
    const node = svg.node();
    if (!node) return;

    const width   = node.clientWidth;
    const height  = node.clientHeight;
    const centerX = width  / 2;
    const centerY = height / 2;
    const lineCount = width < 500 ? 20 : 30;

    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const defs = svg.append("defs");

    const gradient = defs.append("linearGradient")
        .attr("id", "line-gradient")
        .attr("x1","0%").attr("y1","0%")
        .attr("x2","100%").attr("y2","100%");
    gradient.append("stop").attr("offset","0%").attr("stop-color","#d9e8ff").attr("stop-opacity",0.9);
    gradient.append("stop").attr("offset","100%").attr("stop-color","#6d8db5").attr("stop-opacity",0.18);

    defs.append("filter").attr("id","soft-blur")
        .append("feGaussianBlur").attr("stdDeviation",22);

    svg.append("circle")
        .attr("cx",centerX).attr("cy",centerY)
        .attr("r", Math.min(width,height)*0.18)
        .attr("fill","#b8d8ff").attr("opacity",0.07)
        .attr("filter","url(#soft-blur)");

    const layers = d3.range(lineCount).map((index) => {
        const radius    = 70 + index * 8.5;
        const amplitude = 12 + index * 0.55;
        const points    = d3.range(0, Math.PI*2+0.01, Math.PI/42).map((angle) => {
            const distortion =
                Math.sin(angle*3 + index*0.28) * amplitude +
                Math.cos(angle*5 - index*0.15) * amplitude * 0.38;
            const r = radius + distortion;
            return [centerX + Math.cos(angle)*r, centerY + Math.sin(angle)*r*0.72];
        });
        return { index, points };
    });

    const line = d3.line().curve(d3.curveBasisClosed).x(d=>d[0]).y(d=>d[1]);

    svg.append("g").selectAll("path")
        .data(layers).join("path")
        .attr("d", d => line(d.points))
        .attr("fill","none")
        .attr("stroke","url(#line-gradient)")
        .attr("stroke-width", d => d.index%6===0 ? 1.3 : 0.8)
        .attr("stroke-opacity", d => 0.14 + d.index*0.015);
}

renderGenerativeArt();
window.addEventListener("resize", renderGenerativeArt);
