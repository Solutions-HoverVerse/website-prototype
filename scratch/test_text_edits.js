const agentEngine = require('../studio/agent-engine');

async function test() {
  console.log('--- Test 1: Selected Element Text Edit ---');
  const res1 = await agentEngine.processExecutiveEdit({
    prompt: 'Change this to "One Platform. Three Unified Layers."',
    targetPageFile: 'platform.html',
    selectedElement: {
      tag: 'h1',
      className: 'h-1',
      text: 'One platform. Three layers.',
      outerOpening: '<h1 class="h-1">'
    }
  });
  console.log('Result 1:', res1.success, res1.summary);

  console.log('--- Test 2: Button CTA Text Edit ---');
  const res2 = await agentEngine.processExecutiveEdit({
    prompt: 'Make the demo button say "Schedule an Executive Briefing"',
    targetPageFile: 'platform.html'
  });
  console.log('Result 2:', res2.success, res2.summary);

  console.log('--- Test 3: Revert / Undo ---');
  agentEngine.undoLastChange();
  agentEngine.undoLastChange();
  console.log('Undone both test changes.');
}

test();
