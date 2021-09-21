import { queryAll } from '../subDomainRegistrar'
import { fromWei } from 'ethjs-unit'
import { getOwner } from '@energywebfoundation/ui'

const defaults = {
  subDomainState: []
}

const resolvers = {
  Mutation: {
    async getSubDomainAvailability(_, { name }, { cache }) {
      //clear old search results
      cache.writeData({
        data: {
          subDomainState: []
        }
      })
      const nodes = await queryAll(name)
      const cachedNodes = []

      const promises = nodes.map(subDomainPromise =>
        subDomainPromise
          .then(async node => {
            let owner = null
            //console.log("yolo node", node)
            if (!node.available) {
              //owner = await getOwner(`${node.label}.${node.domain}.eth`)
              owner = await getOwner(`${node.label}.${node.domain}.ewc`)
            }
            const newNode = {
              ...node,
              //id: `${node.label}.${node.domain}.eth`,
              id: `${node.label}.${node.domain}.ewc`,
              owner,
              //name: `${node.label}.${node.domain}.eth`,
              name: `${node.label}.${node.domain}.ewc`,
              state: node.available ? 'Open' : 'Owned',
              price: fromWei(node.price, 'ether'),
              __typename: 'SubDomain'
            }

            cachedNodes.push(newNode)

            const data = {
              subDomainState: [...cachedNodes]
            }

            cache.writeData({ data })
          })
          .catch(e => console.log('ERROR in subdomain results', e))
      )

      return Promise.all(promises).then(() => {
        return cachedNodes
      })
    }
  }
}

export default resolvers

export { defaults }
