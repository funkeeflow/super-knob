import { SuperKnob } from '../src/Component/SuperKnob.ts';
const cards = document.querySelectorAll<HTMLAreaElement>('.demo-card');

function isCustomEvent(event: Event): event is CustomEvent {
  return "detail" in event;
}

cards.forEach((card) => {
  const value = card.querySelector<HTMLSpanElement>('.demo-card .value');
  const knob = card.querySelector<SuperKnob>('super-knob');
  if (!knob || !value) return;

  knob.addEventListener('change', (event: Event) => {
    if (isCustomEvent(event)) {
      value.innerText = event.detail.value;
    }
  });
});