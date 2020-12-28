import { useMultiwallet } from '@renproject/multiwallet-ui'
import { burnMachine, BurnMachineSchema, GatewaySession } from '@renproject/ren-tx'
import { useMachine } from '@xstate/react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { env } from '../../constants/environmentVariables'
import { db } from '../../services/database/database'
import { DbGatewaySession } from '../../services/database/firebase/firebase'
import { getRenJs } from '../../services/renJs'
import { burnChainMap, releaseChainMap } from '../../services/rentx'
import { $network } from '../network/networkSlice'
import { updateTransaction } from '../transactions/transactionsSlice'

export type BurnMachineSchemaState = keyof BurnMachineSchema['states'];
export const useBurnMachine = (burnTransaction: GatewaySession) => {
  const { enabledChains } = useMultiwallet()
  const network = useSelector($network)
  const providers = Object.entries(enabledChains).reduce(
    (c, n) => ({
      ...c,
      [n[0]]: n[1].provider,
    }),
    {}
  )
  return useMachine(burnMachine, {
    context: {
      tx: burnTransaction,
      providers,
      sdk: getRenJs(network),
      fromChainMap: burnChainMap,
      toChainMap: releaseChainMap,
      // If we already have a transaction, we need to autoSubmit
      // to check the tx status
      autoSubmit: !!Object.values(burnTransaction.transactions)[0],
    },
    devTools: env.XSTATE_DEVTOOLS,
  })
}

export enum BurnState {
  restoring = 'restoring',
  created = 'created',
  createError = 'createError',
  srcSettling = 'srcSettling',
  srcConfirmed = 'srcConfirmed',
  destInitiated = 'destInitiated', // We only care if the txHash has been issued by renVM
}

export const releaseTxStateUpdateSequence = [
  BurnState.created,
  BurnState.srcSettling,
  BurnState.srcConfirmed,
  BurnState.destInitiated,
]
export const shouldUpdateReleaseTx = (
  tx: GatewaySession | DbGatewaySession,
  dbTx: DbGatewaySession,
  state: string
) => {
  // update when the new state is next in sequence
  // will prevent multiple updates in separate sessions
  const dbState = dbTx?.meta?.state
  if (!dbState) {
    // update when no state
    return true
  }
  const dbStateIndex = releaseTxStateUpdateSequence.indexOf(
    dbState as BurnState
  )
  const stateIndex = releaseTxStateUpdateSequence.indexOf(state as BurnState)
  if (stateIndex <= 0) {
    //dont update for created (updated during creation) or not supported states
    return false
  }
  return stateIndex > dbStateIndex
}
export const useReleaseTransactionPersistence = (
  tx: GatewaySession | DbGatewaySession,
  state: BurnMachineSchemaState
) => {
  const dispatch = useDispatch()
  useEffect(() => {
    if (!state) {
      return
    }
    db.getTx(tx)
      .then((dbTx) => {
        if (shouldUpdateReleaseTx(tx, dbTx, state)) {
          const newDbTx = { ...tx, meta: { state } }
          db.updateTx(newDbTx).then(() => {
            dispatch(updateTransaction(newDbTx))
          })
        }
      })
      .catch((err) => {
        console.warn('Release Tx synchronization failed', err)
      })
  }, [dispatch, tx, state])
}
