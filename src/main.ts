import './app.css'
import App from './App.svelte'
import vConsole from 'vconsole'
import { injectSpeedInsights } from '@vercel/speed-insights';

injectSpeedInsights();

// new vConsole()

const app = new App({
  target: document.getElementById('app')!,
})

export default app
