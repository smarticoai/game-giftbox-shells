# Giftbox game
This is an example of custom game UI implemented on Smartico.ai gamification platform using [Public API](https://github.com/smarticoai/public-api).

![Exampel of the game!](/assets/demo.gif "Demo")

- Demo - https://demo.smartico.ai/custom-game/game-giftbox-shells/index.html
- More examples - https://expo.smartico.ai/widgets/intro 



To run:
```
npm install
npm run dev
```


The main logic of the game

1. call _smartico.api.getMiniGames()  - to get available games and find needed
2. call _smartico.api.playMiniGame(123) - to play a game with specified id, as result you will get prize
3. Visualize prize in your own way

You will need to adjust following variables for the real setup
```javascript

// ID of your game template that is set in Smartico BackOffice
const _saw_template_id = 690; 
// Label & brand keys that are specific for your setup, please conact your Success Manager
const _label_key = 'a6e7ac26-c368-4892-9380-96e7ff82cf3e-4';
const _brand_key = 'f86271e6';

// ID and language of currently identified user
window._smartico_user_id = 'test48054049';
window._smartico_language = 'en'; 
```
