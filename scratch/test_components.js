// Test script to run both custom elements in a simulated DOM environment
class MockHTMLElement {
  constructor() {
    this.shadowRoot = null;
  }
  addEventListener() {}
  removeEventListener() {}
  attachShadow(opts) {
    this.shadowRoot = {
      innerHTML: '',
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: () => null
    };
    return this.shadowRoot;
  }
  contains() { return false; }
}

global.HTMLElement = MockHTMLElement;
global.window = {
  scrollY: 0,
  addEventListener: () => {},
  matchMedia: () => ({ matches: false }),
  requestAnimationFrame: () => 1
};
global.document = {
  addEventListener: () => {},
  createElement: () => ({ getContext: () => null })
};
global.customElements = {
  _defs: {},
  get(name) { return this._defs[name]; },
  define(name, cls) { this._defs[name] = cls; }
};

try {
  require('../wix-repo/src/public/hoververse-home.js');
  console.log('hoververse-home loaded successfully');
  const Home = global.customElements.get('hoververse-home');
  const instHome = new Home();
  instHome.connectedCallback();
  console.log('instHome.connectedCallback() ran successfully');
  console.log('Home shadow length:', instHome.shadowRoot.innerHTML.length);
  console.log('Home has header:', instHome.shadowRoot.innerHTML.includes('<header class="site-header">'));
  console.log('Home has footer:', instHome.shadowRoot.innerHTML.includes('<footer class="footer">'));
} catch (e) {
  console.error('ERROR in hoververse-home:', e);
}

try {
  require('../wix-repo/src/public/hoververse-solutions.js');
  console.log('hoververse-solutions loaded successfully');
  const Sol = global.customElements.get('hoververse-solutions');
  const instSol = new Sol();
  instSol.connectedCallback();
  console.log('instSol.connectedCallback() ran successfully');
  console.log('Solutions has header:', instSol.shadowRoot.innerHTML.includes('<header class="site-header">'));
  console.log('Solutions has footer:', instSol.shadowRoot.innerHTML.includes('<footer class="footer">'));
} catch (e) {
  console.error('ERROR in hoververse-solutions:', e);
}
