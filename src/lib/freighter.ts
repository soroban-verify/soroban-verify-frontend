import {
  isConnected,
  requestAccess,
  getAddress,
  signMessage,
} from '@stellar/freighter-api'

/**
 * Freighter is needed for exactly one thing: project owners signing an
 * ownership claim over a verification record. Reading is always
 * permissionless — never gate a read path behind the wallet.
 */

export async function isFreighterAvailable(): Promise<boolean> {
  try {
    const result = await isConnected()
    return result.isConnected
  } catch {
    return false
  }
}

export async function connectWallet(): Promise<string> {
  const access = await requestAccess()
  if (access.error) throw new Error(access.error)
  return access.address
}

export async function getConnectedAddress(): Promise<string | null> {
  try {
    const result = await getAddress()
    return result.address || null
  } catch {
    return null
  }
}

/** Sign an ownership claim over a verification record. */
export async function signOwnershipClaim(
  verificationId: string,
  contractId: string,
): Promise<{ signerAddress: string; signedMessage: string }> {
  const message = `soroban-verify ownership claim\nverification: ${verificationId}\ncontract: ${contractId}\nissued: ${new Date().toISOString()}`
  const result = await signMessage(message)
  if (result.error) throw new Error(result.error)
  return {
    signerAddress: result.signerAddress,
    signedMessage:
      typeof result.signedMessage === 'string'
        ? result.signedMessage
        : (result.signedMessage?.toString('base64') ?? ''),
  }
}
