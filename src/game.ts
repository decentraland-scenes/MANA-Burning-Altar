import { getProvider } from '@decentraland/web3-provider'
import { getUserAccount } from '@decentraland/EthereumController'
import * as eth from '../node_modules/eth-connect/esm'

import ManaBurnerABI from './abis/ManaBurner'
import ManaTokenABI from './abis/ManaToken'

// If this is on, no transaction is made and the mana is mocked
let DEMO_MODE = true

const MANA_TOKEN_ADDRESS = '0x0f5d2fb29fb7d3cfee444a200298f468908cc942'
const MANA_BURNER_ADDRESS = '0xadfeb1de7876fcabeaf87df5a6c566b70f970018'
const BURN_EVENT_TOPIC0 =
  '0xcc16f5dbb4873280815c1ee09dbd06736cffcc184412cf7a71a0fdb75d397ca5'
const ETHERSCAN_API_KEY = '5PGKUW569IBD7GFM7KME15PPQD3BQGNK2S'
const LAST_BLOCKS = 100000 // last X blocks to look for Burn events
const REFRESH_INTERVAL = 30 // in seconds

// Amount of MANA to available to burn
let mana = 0
// Current Ethereum block
let block = 0
// Last amount of mana burnt
let lastAmount = 0
// Last block where mana was burnt
let lastBlock = 0

const initialColor = new Color3(1, 0.3, 0)
const finalColor = new Color3(1, 0, 0)
const textColor = new Color3(14 / 255, 186 / 255, 255 / 255)

export function isFireBurning() {
  if (!lastBlock || !lastAmount) return false
  return block - lastBlock < lastAmount / 10 // For every 10 MANA burnt, the fire burns for 1 block
}

function parseHex(hex) {
  return parseInt(hex.slice(2), 16)
}

function fromWei(wei) {
  return (wei / 10 ** 18) | 0
}

async function refresh() {
  const provider = await getProvider()
  const rm = new eth.RequestManager(provider)

  block = (await rm.eth_blockNumber()) as number

  const manaTokenFactory = new eth.ContractFactory(rm, ManaTokenABI)
  const manaTokenInstance = (await manaTokenFactory.at(
    MANA_TOKEN_ADDRESS
  )) as any
  mana = fromWei(await manaTokenInstance.balanceOf(MANA_BURNER_ADDRESS))

  const url = `https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=${block -
    LAST_BLOCKS}&toBlock=latest&address=${MANA_TOKEN_ADDRESS}&topic0=${BURN_EVENT_TOPIC0}&apikey=${ETHERSCAN_API_KEY}`
  log(url)
  const events = await fetch(url).then(res => res.json())
  const result = events.result.pop()

  if (!result) return

  const newLastBlock = parseHex(result.blockNumber)
  // only update if the data is more recent
  // this is so when the user burns mana, he doesn't have
  // to wait for the tx to be mined, and this process doesn't
  // override the optimiscally updated values
  if (newLastBlock > lastBlock) {
    lastAmount = fromWei(parseHex(result.data))
    lastBlock = newLastBlock
  }

  log(`Current block: ${block}`)
  log(`Avaialbe: ${mana} MANA`)
  log(`${lastAmount} MANA burnt ${block - lastBlock} blocks ago`)
  log('Is fire burning:', isFireBurning())

  if (DEMO_MODE) {
    mana = 25000
    lastAmount = 0
  }

  update()
}

async function burn() {
  if (mana === 0) return
  const provider = await getProvider()
  const rm = new eth.RequestManager(provider)

  const ManaBurnerContract = new eth.ContractFactory(rm, ManaBurnerABI)
  const manaBurnerInstance = (await ManaBurnerContract.at(
    MANA_BURNER_ADDRESS
  )) as any
  const account = await getUserAccount()
  if (!DEMO_MODE) {
    await manaBurnerInstance.burn({
      from: account
    })
  }

  lastAmount = mana
  lastBlock = block
  mana = 0

  buttonGlow = 5

  update()
}

class RefreshSystem {
  totalTime = 0
  update(dt: number) {
    if (this.totalTime > REFRESH_INTERVAL) {
      this.totalTime = 0
      refresh()
    }
    this.totalTime += dt
  }
}

engine.addSystem(new RefreshSystem())

// kick it
executeTask(refresh)

/// ------

const off = new GLTFShape('models/BotonApagado.gltf')
const on = new GLTFShape('models/BotonPrendido.gltf')
const button = new Entity()
button.addComponent(new Transform({ position: new Vector3(8, 0, 8), rotation: Quaternion.Euler(0,180,0) }))
button.addComponent(off)
button.addComponent(new OnPointerDown(burn))
engine.addEntity(button)

// base
let base = new Entity()
base.addComponent(new GLTFShape('models/Base.gltf'))
base.addComponent(
  new Transform({
    position: new Vector3(8, 0, 8),
    rotation: Quaternion.Euler(0,180,0)
  })
)
engine.addEntity(base)

// bar
let bar = new Entity()
bar.addComponent(new GLTFShape('models/Barra.gltf'))
bar.addComponent(
  new Transform({
    position: new Vector3(8, 0, 8),
    scale: new Vector3(1, 0.47, 1),
    rotation: Quaternion.Euler(0,180,0)
  })
)
engine.addEntity(bar)

// help
let helpStone = new Entity()
helpStone.addComponent(new GLTFShape('models/Help_Stone.gltf'))
helpStone.addComponent(
  new Transform({
    position: new Vector3(8, 0, 8)
  })
)
helpStone.addComponent(new OnPointerDown(() => (helpVisible = 10)))
engine.addEntity(helpStone)

const helpText = new Entity()
const helpShape = new GLTFShape('models/Papel.gltf')
helpText.addComponent(new Billboard(true, true, true))
helpText.addComponent(helpShape)
helpText.addComponent(
  new Transform({
    position: new Vector3(7, 2, 11),
    scale: new Vector3(0.5, 0.5, 0.5),
    rotation: Quaternion.Euler(0, 180, 0)
  })
)
engine.addEntity(helpText)

// info
let infoStone = new Entity()
infoStone.addComponent(new GLTFShape('models/Stone.gltf'))
infoStone.addComponent(
  new Transform({
    position: new Vector3(8, 0, 8),
    rotation: Quaternion.Euler(0,180,0)
  })
)
engine.addEntity(infoStone)
const infoText = new Entity()
const infoShape = new TextShape(`Loading...`)
infoShape.color = new Color3(0.7, 0.7, 0.7)
infoShape.width = 3
infoShape.fontSize = 10
infoText.addComponent(infoShape)
infoText.addComponent(
  new Transform({
    position: new Vector3(9.95, 1.4, 11),
    rotation: Quaternion.Euler(0, -64, 0),
    scale: new Vector3(0.9, 0.9, 0.9)
  })
)
engine.addEntity(infoText)

// light
let light = new Entity()
light.addComponent(new GLTFShape('models/Light.gltf'))
light.addComponent(
  new Transform({
    position: new Vector3(8, 0, 8),
    rotation: Quaternion.Euler(0,180,0)
  })
)
engine.addEntity(light)

// -- Animations

let barScale = 0.46
let helpVisible = 0
let buttonGlow = 0
let isButtonGlowing = false
// let lightScale = 0

function update() {
  barScale = Math.min(mana / 100000, 1) * 0.54 + 0.46
  infoShape.value = `${mana.toLocaleString()} MANA`
  // lightScale = isFireBurning() ? 1 : 0
}

class AnimationSystem {
  update(dt: number) {
    const transformBar = bar.getComponent(Transform)
    transformBar.scale = new Vector3(
      1,
      transformBar.scale.y + (barScale - transformBar.scale.y) / 10,
      1
    )

    // const transformLight = bar.getComponent(Transform)
    // log(lightScale, transformLight.scale.y)
    // transformLight.scale = new Vector3(
    //   0,
    //   transformLight.scale.y + (lightScale - transformLight.scale.y) / 10,
    //   0
    // )

    if (helpVisible > 0) {
      helpShape.visible = true
      helpVisible -= dt
    } else {
      helpShape.visible = false
    }

    if (buttonGlow > 0) {
      if (!isButtonGlowing) {
        isButtonGlowing = true
        button.removeComponent(off)
        button.addComponent(on)
      }
      buttonGlow -= dt
    } else {
      if (isButtonGlowing) {
        isButtonGlowing = false
        button.removeComponent(on)
        button.addComponent(off)
      }
    }
  }
}

engine.addSystem(new AnimationSystem())

// -- Particles

@Component('particle')
class Particle {
  life = Math.random()
  seed = Math.random() - Math.random()
  constructor(public origin: Vector3) {}
}

const material = new Material()
  material.albedoColor = Color3.Lerp(initialColor, finalColor, 1 / 5)
  material.emissiveColor = Color3.Lerp(initialColor, finalColor, 1 / 11)
  material.emissiveIntensity = 2


let fireHeight = 0

class ParicleSystem {
  group = engine.getComponentGroup(Particle)
  update(dt: number) {
    if (isFireBurning()) {
      fireHeight = fireHeight + (2 - fireHeight) / 10
      shape.visible = true
      for (const entity of this.group.entities) {
        const particle = entity.getComponent(Particle)
        const transform = entity.getComponent(Transform)
        const currentMaterial = (particle.life * 10) | 0
        particle.life += dt
        particle.life %= 1
        transform.position = new Vector3(
          particle.origin.x +
            Math.sin((particle.life + particle.seed) * 5) *
              (1 - particle.life / 1.5) *
              0.5,
          particle.origin.y + particle.life * fireHeight,
          particle.origin.z +
            Math.cos((particle.life + particle.seed) * 5) *
              (1 - particle.life / 1.5) *
              0.5
        )
        const scale = 0.2 - particle.life / 5
        transform.scale = new Vector3(scale, scale, scale)
        transform.rotation = Quaternion.Euler(
          0,
          0,
          particle.life * 360 + particle.seed * 360
        )
        const nextMaterial = (particle.life * 10) | 0

      }
    } else {
      fireHeight = 0
      shape.visible = false
    }
  }
}

const particles: Entity[] = []
const origin = new Vector3(8, 1.3, 8)
const shape = new PlaneShape()
const billboard = new Billboard()

for (let i = 0; i < 50; i++) {
  const particle = new Entity()
  particle.addComponent(shape)
  particle.addComponent(billboard)
  particle.addComponent(material)
  particle.addComponent(new Particle(origin))
  particle.addComponent(
    new Transform({ position: origin, scale: new Vector3(0.05, 0.05, 0.05) })
  )
  engine.addEntity(particle)
  particles.push(particle)
}

engine.addSystem(new ParicleSystem())
