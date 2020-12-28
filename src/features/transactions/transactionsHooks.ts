import { GatewaySession } from '@renproject/ren-tx'
import { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { paths } from '../../pages/routes'
import { useSelectedChainWallet } from '../../providers/multiwallet/multiwalletHooks'
import { useNotifications } from '../../providers/Notifications'
import { db } from '../../services/database/database'
import { removeTransaction } from './transactionsSlice'
import { TxType } from './transactionsUtils'

export const useTransactionDeletion = (tx: GatewaySession) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { showNotification } = useNotifications()
  const { walletConnected } = useSelectedChainWallet()

  const [menuOpened, setMenuOpened] = useState(false)
  const handleMenuClose = useCallback(() => {
    setMenuOpened(false)
  }, [])
  const handleMenuOpen = useCallback(() => {
    if (walletConnected) {
      setMenuOpened(true)
    }
  }, [walletConnected])
  const handleDeleteTx = useCallback(() => {
    db.deleteTx(tx).then(() => {
      dispatch(removeTransaction(tx))
      showNotification(`Transaction ${tx.id} deleted.`)
      history.push(tx.type === TxType.MINT ? paths.MINT : paths.RELEASE)
    })
  }, [dispatch, history, showNotification, tx])

  return { menuOpened, handleMenuOpen, handleMenuClose, handleDeleteTx }
}
