## Mana transaction

Fees collected from the Marketplace are stored in this Altar.

Anyone can burn the MANA collected by touching the Altar's stone
and light the flame, which will last 1 block for every 10 MANA burnt.

<img src="screenshot/screenshot.png" width="500"> 

This scene shows you:

- How to call functions from a smart contract
- How to make a particle effect handling multiple entities
- How to create custom components to store custom data about entities
- How to use component groups to handle all entities that share the same components
- How to create a system to update entity positions frame by frame





## Try it out

**Install the CLI**

Download and install the Decentraland CLI by running the following command:

```bash
npm i -g decentraland
```

**Previewing the scene**

Download this example and navigate to its directory, then run:

```
$:  dcl start
```

Any dependencies are installed and then the CLI opens the scene in a new browser tab.


Paste the following to the end of the URL in the browser window:

```
&ENABLE_WEB3
```

For example, if the URL is `http://127.0.0.1:8000?position=0%2C0&SCENE_DEBUG_PANEL`, make it `http://127.0.0.1:8000?position=0%2C0&SCENE_DEBUG_PANEL&ENABLE_WEB3`

> Note: When running a preview of a scene that uses one of the ethereum libraries, you must have Metamask or Dapper open and you must add this string.

> IMPORTANT: You **MUST** be on mainnet for this in order to work


**Scene Usage**

The amount of mana that's ready to be burnt is displayed as a glowing blue column at the back of the altar. Click on the fire icon at the bottom to burn it. Metamask should then ask for your validation that you agree to the transaction.

This triggers the burning of these tokens. It also shows this by creating a fire as a particle system.

The fire keeps burning for the duration of one Ethereum block mining for every 10 MANA that was burnt. If someone enters the scene while the last fire is still burning, they will also see the fire.

Learn more about how to use blockchain in your scenes in [Blockchain operations](https://docs.decentraland.org/blockchain-interactions/scene-blockchain-operations/) in our docs site.

If something doesn’t work, please [file an issue](https://github.com/decentraland-scenes/Awesome-Repository/issues/new).


## Demo Mode

You can set the variable `DEMO_MODE` to `true` and the collected MANA will be 25,000 and you won't need to sign a transaction to push the burn button

## Copyright info

This scene is protected with a standard Apache 2 licence. See the terms and conditions in the [LICENSE](/LICENSE) file.
