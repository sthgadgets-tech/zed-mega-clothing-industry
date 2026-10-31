import { useEffect, useState } from 'react'
import { Bell, BellOff, BellRing, Download, Loader2, Send } from 'lucide-react'
import { clearInstallPrompt, disablePush, enablePush, getPushState, onInstallPrompt, sendTestPush, type InstallPrompt, type PushState } from './pwa'

const stateText: Record<PushState, string> = {
  on: 'This device gets an alert for every new quote request.',
  off: 'Turn on alerts to hear about new quote requests on this device.',
  denied: 'Notifications are blocked for this site. Allow them in your browser or phone settings, then reload.',
  unsupported: 'This browser does not support push notifications. Use Chrome, Edge, Firefox or Safari.',
  'needs-install': 'On iPhone, tap Share → "Add to Home Screen", open ZED Admin from there, then turn on alerts.',
}

// Install button (Android/desktop Chrome) and push notification controls for the admin app.
export function AdminNotifications() {
  const [state, setState] = useState<PushState | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null)

  useEffect(() => {
    getPushState().then(setState).catch(() => setState('unsupported'))
    return onInstallPrompt(setInstallPrompt)
  }, [])

  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true)
    setMessage(null)
    try {
      await action()
      setMessage({ type: 'ok', text: success })
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Something went wrong.' })
    } finally {
      setState(await getPushState().catch(() => 'unsupported' as const))
      setBusy(false)
    }
  }

  const install = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    await installPrompt.userChoice
    clearInstallPrompt()
  }

  return (
    <section className="admin-panel admin-notify">
      <div className="admin-notify-head">
        <span className={`admin-notify-icon ${state === 'on' ? 'is-on' : ''}`}>{state === 'on' ? <BellRing size={20} /> : <Bell size={20} />}</span>
        <div>
          <h2>Quote alerts</h2>
          <p>{state ? stateText[state] : 'Checking this device…'}</p>
        </div>
      </div>
      <div className="admin-notify-actions">
        {installPrompt && <button type="button" className="admin-button admin-button-secondary" onClick={install}><Download size={16} /> Install app</button>}
        {state === 'off' && <button type="button" className="admin-button admin-button-primary" disabled={busy} onClick={() => run(enablePush, 'Alerts are on for this device.')}>{busy ? <Loader2 size={16} className="admin-spin" /> : <Bell size={16} />} Turn on alerts</button>}
        {state === 'on' && <>
          <button type="button" className="admin-button admin-button-primary" disabled={busy} onClick={() => run(sendTestPush, 'Test sent. It should arrive in a few seconds.')}>{busy ? <Loader2 size={16} className="admin-spin" /> : <Send size={16} />} Send test</button>
          <button type="button" className="admin-button admin-button-secondary" disabled={busy} onClick={() => run(disablePush, 'Alerts are off for this device.')}><BellOff size={16} /> Turn off</button>
        </>}
      </div>
      {message && <p className={`admin-product-msg is-${message.type}`}>{message.text}</p>}
    </section>
  )
}
