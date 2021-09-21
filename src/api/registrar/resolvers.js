import crypto from 'crypto'
import { isShortName } from '../../utils/utils'

import {
  getEntry,
  getRentPrice,
  commit,
  getMinimumCommitmentAge,
  register,
  renew,
  releaseDeed,
  transferOwner,
  reclaim,
  submitProof,
  getOwner
} from '@energywebfoundation/ui'

import modeNames from '../modes'
import { sendHelper } from '../resolverUtils'

const defaults = {}
const secrets = {}

function randomSecret() {
  return '0x' + crypto.randomBytes(32).toString('hex')
}

const resolvers = {
  Query: {
    async getRentPrice(_, { name, duration, tld }, { cache }) {
      return await getRentPrice(name, duration, tld)
    },
    async getMinimumCommitmentAge(_, { tld }) {
      try {
        const minCommitmentAge = await getMinimumCommitmentAge(tld)
        return parseInt(minCommitmentAge)
      } catch (e) {
        console.log(e)
      }
    }
  },
  Mutation: {
    async commit(_, { label, tld }, { cache }) {
      //Generate secret
      const secret = randomSecret()
      secrets[label] = secret
      const tx = await commit(label, secret, tld)
      return sendHelper(tx)
    },
    async register(_, { label, duration, tld }) {
      const secret = secrets[label]
      const tx = await register(label, duration, secret, tld)

      return sendHelper(tx)
    },
    async reclaim(_, { name, address, tld }) {
      //console.log("yolo reclaim", label, tld)
      const tx = await reclaim(name, address, tld)
      return sendHelper(tx)
    },
    async renew(_, { label, duration, tld }) {
      const tx = await renew(label, duration, tld)
      return sendHelper(tx)
    },
    async getDomainAvailability(_, { name, tld }, { cache }) {
      try {
        const {
          state,
          registrationDate,
          revealDate,
          value,
          highestBid
        } = await getEntry(name, tld)
        let owner = null
        if (isShortName(name)) {
          cache.writeData({
            data: defaults
          })
          return null
        }

        if (modeNames[state] === 'Owned') {
          owner = await getOwner(`${name}.${tld}`)
        }

        const data = {
          domainState: {
            name: `${name}.${tld}`,
            state: modeNames[state],
            registrationDate,
            revealDate,
            value,
            highestBid,
            owner,
            __typename: 'DomainState'
          }
        }

        cache.writeData({ data })

        return data.domainState
      } catch (e) {
        console.log('Error in getDomainAvailability', e)
      }
    },
    async setRegistrant(_, { name, address }) {
      const tx = await transferOwner(name, address)
      return sendHelper(tx)
    },
    async releaseDeed(_, { label }) {
      const tx = await releaseDeed(label)
      return sendHelper(tx)
    },
    async submitProof(_, { name, parentOwner }) {
      const tx = await submitProof(name, parentOwner)
      return sendHelper(tx)
    }
  }
}

export default resolvers

export { defaults }
