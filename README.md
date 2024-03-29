# super-knob 🎛️

A vanilla web component written in TypeScript for all your circular input needs. Fittable, customizable with a small footprint. `Brotli size = ~0.56kb`

<!-- ## Demo
 [**See it in action here** 🍜 ][link-demo] -->

## Installation

```sh
npm install super-knob
```

## Usage

```js
import 'super-knob';
```
## Custom Sequence

The default sequence is the Konami Code (`↑` `↑` `↓` `↓` `←` `→` `←` `→` `a` `b`).

You can pass in your own sequence like so:
```js
new Konami({ sequence: ['r','a','m','e','n'] });
```
The Sequence needs to be composed of KeyboardEvent.key values.
See the full list here:
https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values

## Timeout
You can define the max. time between two key strokes, to make it event harder to enter the sequence. The default time is set to `600ms`. Going below `200ms` makes it almost impossible to hit the sequence in the right order and time.
```js
new Konami({ timeout: 450 }); // time in ms
```
*Note:* If the max. time between two key strokes is exceeded, the validation will start from the begining.

## Events
There are a couple of events, you can listen to, like so:
```js
/* press ⬆️ */
konami.on('input', (event) => {
  /* { key: 'ArrowUp', match: true, position: 0, { native KeyboardEvent } } */
  /* your magic goes here */
})
```

Removing them is quite easy:
```js
konami.off('input')
```

Here is a list of all events:

| Event | Event Object                                                                            |
|-------|-----------------------------------------------------------------------------------------|
| *start*| { position: `number` }                                                                    |
| *stop*  | `undefined`                                                                               |
| *input* | { key: `string`, match: `boolean`, position: `number`, keyboardEvent: `KeyboardEvent `} |
| *success* | { lastKey: `string`, lastPosition: `number` }                                                                                        |
| *timeout* | { lastKey: `sting`, lastPosition: `number`, lastMatch: `boolean` }                                                                                         |

**key** \
The `key` property holds the current key pressed by the user.

**postion** \
The `position` property holds the current position in the pattern. If the current button is not matched with the pattern, `position` will be `-1` instead.

**lastPosition** \
The `lastPosition` property holds last position if the pattern has been successfuly finished.

**lastKey** \
The `lastKey` property holds last key if the pattern has been successfuly finished.

**match** \
The `match` property holds the matching state of the most recent input.

**lastMatch** \
The `lastMatch` property holds the matching state of the most recent input, **after a timeout occured**.

**keyboardEvent** \
The `keyboardEvent` is the native keyboard event for the `keydown` event.

[link-demo]: https://

## Lincense
MIT