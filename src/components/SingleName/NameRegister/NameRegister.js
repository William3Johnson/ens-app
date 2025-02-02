import React, { useState, useReducer } from 'react'
import styled from '@emotion/styled'
import { Query } from 'react-apollo'

import { GET_MINIMUM_COMMITMENT_AGE } from 'graphql/queries'
import { useInterval, useEthPrice } from 'components/hooks'
import { registerMachine, registerReducer } from './registerReducer'
import { sendNotification } from './notification'
import { yearInSeconds } from 'utils/dates'

import Loader from 'components/Loader'
import Explainer from './Explainer'
import CTA from './CTA'
import Progress from './Progress'
import NotAvailable from './NotAvailable'
import NotAvailableDuringMigration from './NotAvailableDuringMigration'
import Pricer from '../Pricer'

const NameRegisterContainer = styled('div')`
  padding: 20px 40px;
`

const NameRegister = ({
  domain,
  waitTime,
  refetch,
  refetchIsMigrated,
  readOnly,
  registrationOpen,
  duringMigration
}) => {
  const [step, dispatch] = useReducer(
    registerReducer,
    registerMachine.initialState
  )
  const incrementStep = () => dispatch('NEXT')
  const decrementStep = () => dispatch('PREVIOUS')
  const [years, setYears] = useState(1)
  const [secondsPassed, setSecondsPassed] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const { loading: ethUsdPriceLoading, price: ethUsdPrice } = useEthPrice()

  useInterval(
    () => {
      if (secondsPassed < waitTime) {
        setSecondsPassed(s => s + 1)
      } else {
        setTimerRunning(false)
        incrementStep()
        sendNotification(`${domain.name} is ready to be registered`)
      }
    },
    timerRunning ? 1000 : null
  )

  const parsedYears = parseFloat(years)
  const duration = yearInSeconds * parsedYears
  const oneMonthInSeconds = 2419200
  const twentyEightDaysInYears = oneMonthInSeconds / yearInSeconds
  const isAboveMinDuration = parsedYears > twentyEightDaysInYears
  const waitPercentComplete = (secondsPassed / waitTime) * 100
  if (duringMigration) return <NotAvailableDuringMigration domain={domain} />

  if (!registrationOpen) return <NotAvailable domain={domain} />

  return (
    <NameRegisterContainer>
      {step === 'PRICE_DECISION' && (
        <Pricer
          name={domain.label}
          duration={duration}
          years={years}
          tld={domain.parent.split('.').slice(-1)[0]}
          setYears={setYears}
          ethUsdPriceLoading={ethUsdPriceLoading}
          ethUsdPrice={ethUsdPrice}
        />
      )}

      <Explainer
        step={step}
        waitTime={waitTime}
        waitPercentComplete={waitPercentComplete}
      />
      <Progress step={step} waitPercentComplete={waitPercentComplete} />
      <CTA
        waitTime={waitTime}
        incrementStep={incrementStep}
        decrementStep={decrementStep}
        step={step}
        label={domain.label}
        duration={duration}
        parent={domain.parent}
        secondsPassed={secondsPassed}
        setTimerRunning={setTimerRunning}
        refetch={refetch}
        refetchIsMigrated={refetchIsMigrated}
        isAboveMinDuration={isAboveMinDuration}
        readOnly={readOnly}
      />
    </NameRegisterContainer>
  )
}

const NameRegisterDataWrapper = props => {
  return (
    <Query
      query={GET_MINIMUM_COMMITMENT_AGE}
      variables={{
        tld:
          props.domain.parent.split('.').slice(-1)[0] === 'ewc' ? 'ewc' : 'eth'
      }}
    >
      {({ data, loading, error }) => {
        if (loading) return <Loader withWrap={true} large />
        if (error) {
          console.log(error)
        }
        const { getMinimumCommitmentAge } = data
        return <NameRegister waitTime={getMinimumCommitmentAge} {...props} />
      }}
    </Query>
  )
}

export default NameRegisterDataWrapper
