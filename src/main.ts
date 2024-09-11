import './app.css'
import App from './App.svelte'
import vConsole from 'vconsole'
import { inject } from "@vercel/analytics"
import { injectSpeedInsights } from '@vercel/speed-insights';

inject()
injectSpeedInsights();

// new vConsole()

const app = new App({
  target: document.getElementById('app')!,
})

export default app
