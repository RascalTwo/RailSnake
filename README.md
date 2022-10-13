[kaboom.js]: https://kaboomjs.com/

# Rail Snake

[![Run on Repl.it](https://repl.it/badge/github/RascalTwo/RailSnake)](https://repl.it/github/RascalTwo/RailSnake)
[![Website](https://img.shields.io/website?url=https://railsnake--rascaltwo.repl.co/)](https://railsnake--rascaltwo.repl.co/)

Rail-themed snake written in [kaboom.js][kaboom.js].

**Link to project:** https://railsnake--rascaltwo.repl.co/

https://user-images.githubusercontent.com/9403665/128609025-1953e58b-5f51-463f-807a-2e68ce5d302d.mp4

## Gameplay

Your goal is to extend your track as long as possible without crashing.

- Arrow keys control movement direction

Crashes can be caused by three things:

- Driving off the grass
- Driving into your own track
- Driving into a powered rail at an incorrect angle

> You can't turn directly off a powered rail

## How It's Made

**Tech Used:** HTML, CSS, JavaScript, [kaboom.js][kaboom.js]

Starting off with two screens, the gameover one and the actual gameplay one, then went with a singleton IIFE to encapsulate the logic accordingly. After getting the tiling system working, I appended the randomized placement of track pieces and the player's movement. Finally I added player movement, collision detection, and scoring.

## Optimizations

While the tiling system does work, It could be optimized by using more kaboom.js native features, additionally the gameplay itself could be customized for non-desktop devices.

## Examples

This isn't the first nor last game I've written using [Kaboom.js][kaboom.js]:

**Infinite Driver:** https://github.com/RascalTwo/InfiniteDriver

**Flappy Bird:** https://github.com/RascalTwo/FlappyBird

## Credits

[Faithful Team]: https://faithful.team/faithful-1-17/

- [Faithful Team][Faithful Team] for the assets
