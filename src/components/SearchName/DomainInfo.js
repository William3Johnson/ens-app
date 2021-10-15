import React from 'react'
import { Query } from 'react-apollo'
import DomainItem from '../DomainItem/DomainItem'
import { GET_FAVOURITES, GET_SINGLE_NAME } from '../../graphql/queries'
import { NetworkError } from '../Error/Errors'

export const DomainInfo = ({ domainState, isFavourite, loading }) => {
  return (
    <DomainItem
      loading={loading}
      domain={domainState}
      isFavourite={isFavourite}
    />
  )
}

const DomainInfoContainer = ({ searchTerm }) => {
  return (
    <Query query={GET_SINGLE_NAME} variables={{ name: searchTerm + '.ewc' }}>
      {({ data, loading, error }) => {
        const { singleName } = data
        if (error) {
          console.error(error)
          return null
        }
        if (!loading && Object.keys(data).length < 1) {
          return (
            <NetworkError
              message={`Network Selected does not support the ".ewc" name you want to buy, please change networks`}
              browserMessage={
                'Please change your dapp browser to Volta, or EWC'
              }
            />
          )
        } else {
          return (
            <Query query={GET_FAVOURITES}>
              {({ data: { favourites } }) => (
                <DomainItem
                  loading={loading}
                  domain={singleName}
                  isFavourite={
                    singleName &&
                    favourites.filter(domain => domain.name === singleName.name)
                      .length > 0
                  }
                />
              )}
            </Query>
          )
        }
      }}
    </Query>
  )
}

export default DomainInfoContainer
