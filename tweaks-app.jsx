// tweaks-app.jsx — Hoververse Tweaks panel (mounts into #tweaks-root)
const { useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#12A06A",
  "headingScale": 1,
  "trustLabelSize": 19,
  "trustLabelBold": true,
  "reduceHeroMotion": false
}/*EDITMODE-END*/;

function HoververseTweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--green", t.accent);
    r.style.setProperty("--type-scale", String(t.headingScale));
    r.style.setProperty("--trust-label-size", t.trustLabelSize + "px");
    r.style.setProperty("--trust-label-weight", t.trustLabelBold ? "800" : "600");
    window.__hvPause = !!t.reduceHeroMotion;
  }, [t]);

  return (
    <React.Fragment>
      <span hidden data-hv-tweaks-ready="true" />
      <TweaksPanel title="Tweaks">
      <TweakSection label="Brand" />
      <TweakColor label="Accent" value={t.accent}
        options={["#12A06A", "#0C9A5B", "#0E8C7A", "#1F9E86"]}
        onChange={(v) => setTweak("accent", v)} />

      <TweakSection label="Typography" />
      <TweakSlider label="Heading scale" value={t.headingScale} min={0.9} max={1.15} step={0.01}
        onChange={(v) => setTweak("headingScale", v)} />

      <TweakSection label="Heads-up strip" />
      <TweakSlider label="Label size" value={t.trustLabelSize} min={14} max={28} step={1} unit="px"
        onChange={(v) => setTweak("trustLabelSize", v)} />
      <TweakToggle label="Bold label" value={t.trustLabelBold}
        onChange={(v) => setTweak("trustLabelBold", v)} />

      <TweakSection label="Motion" />
      <TweakToggle label="Reduce hero motion" value={t.reduceHeroMotion}
        onChange={(v) => setTweak("reduceHeroMotion", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<HoververseTweaks />);
