import { ethers, waffle } from 'hardhat'
import chai from 'chai'
import { TestToken } from '../typechain'

const { expect } = chai

describe('Token', () => {
  let testToken: TestToken

  const fixture = async () => {
    const factory = await ethers.getContractFactory('TestToken')
    return (await factory.deploy()) as TestToken
  }

  beforeEach('deploy TestToken', async () => {
    testToken = await waffle.loadFixture(fixture)
  })
  describe('Functionality', async () => {
    it('Should return name', async () => {
     expect(await testToken.name()).to.eq('Test')
    })
    it('Should mint some tokens', async () => {
      const [deployer, user] = await ethers.getSigners()
      const tokenInstance = testToken.connect(deployer)
      const toMint = ethers.utils.parseEther('1')

      await tokenInstance.mint(user.address, toMint)

      expect(await tokenInstance.totalSupply()).to.eq(toMint)
    })
  })
  describe('Transfer', async () => {
    it('Should transfer tokens between users', async () => {
      const [deployer, sender, receiver] = await ethers.getSigners()
      const deployerInstance = testToken.connect(deployer)
      const toMint = ethers.utils.parseEther('1')

      await deployerInstance.mint(sender.address, toMint)
      expect(await deployerInstance.balanceOf(sender.address)).to.eq(toMint)

      const senderInstance = testToken.connect(sender)
      const toSend = ethers.utils.parseEther('0.4')
      await senderInstance.transfer(receiver.address, toSend)

      expect(await senderInstance.balanceOf(receiver.address)).to.eq(toSend)
    })

    it('Should fail to transfer with low balance', async () => {
      const [deployer, sender, receiver] = await ethers.getSigners()
      const deployerInstance = testToken.connect(deployer)
      const toMint = ethers.utils.parseEther('1')

      await deployerInstance.mint(sender.address, toMint)
      expect(await deployerInstance.balanceOf(sender.address)).to.eq(toMint)

      const senderInstance = testToken.connect(sender)
      const toSend = ethers.utils.parseEther('1.1')

      // Notice await is on the expect
      await expect(senderInstance.transfer(receiver.address, toSend)).to.be.revertedWith(
        'transfer amount exceeds balance'
      )
    })
  })
})
